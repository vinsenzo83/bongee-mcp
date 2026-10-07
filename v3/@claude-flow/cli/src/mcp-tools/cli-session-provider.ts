/** Opt-in execution through locally authenticated CLI sessions. No API credential inheritance. */
import { spawn } from 'node:child_process';
import { StringDecoder } from 'node:string_decoder';
import type { AnthropicCallInput, AnthropicCallResult } from './agent-execute-core.js';
import { getProjectCwd } from './types.js';

export type SessionProvider = 'codex' | 'claude';
export function sessionEnvironment(source: NodeJS.ProcessEnv = process.env): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = {};
  for (const key of ['PATH', 'HOME', 'USER', 'LOGNAME', 'SHELL', 'TMPDIR', 'TEMP', 'TMP', 'LANG', 'LC_ALL', 'TERM', 'CODEX_HOME', 'CLAUDE_CONFIG_DIR']) {
    if (source[key] !== undefined) env[key] = source[key];
  }
  return env;
}

export function sessionArguments(provider: SessionProvider, cwd: string, write: boolean): string[] {
  if (provider === 'codex') return ['exec', '--ignore-user-config', '--json', '--skip-git-repo-check', '--sandbox', write ? 'workspace-write' : 'read-only', '-C', cwd, '-'];
  const tools = write ? 'Read,Glob,Grep,Edit,Write' : 'Read,Glob,Grep';
  return ['-p', '--safe-mode', '--permission-mode', 'default', '--output-format', 'stream-json', '--verbose', '--strict-mcp-config', '--mcp-config', '{"mcpServers":{}}', '--tools', tools, '--allowedTools', tools];
}

/** Require subscription login; configured API key helpers are not session authentication. */
export async function sessionAuthenticated(provider: SessionProvider): Promise<boolean> {
  return new Promise(resolve => {
    const args = provider === 'codex' ? ['login', 'status'] : ['--safe-mode', 'auth', 'status', '--json'];
    const child = spawn(provider, args, { cwd: getProjectCwd(), env: sessionEnvironment(), shell: false, stdio: ['ignore', 'pipe', 'pipe'] });
    let raw = ''; let done = false;
    const finish = (value: boolean) => { if (done) return; done = true; clearTimeout(timer); resolve(value); };
    const timer = setTimeout(() => { child.kill('SIGKILL'); finish(false); }, 10_000);
    child.stdout.on('data', data => { if (raw.length < 65536) raw += data.toString(); });
    child.stderr.on('data', data => { if (raw.length < 65536) raw += data.toString(); });
    child.on('error', () => finish(false));
    child.on('close', code => {
      if (code !== 0) return finish(false);
      if (provider === 'codex') return finish(/Logged in using ChatGPT/i.test(raw));
      try { const status = JSON.parse(raw); finish(status.loggedIn === true && status.authMethod === 'claude.ai'); }
      catch { finish(false); }
    });
  });
}

export function parseSessionOutput(provider: SessionProvider, raw: string): Partial<AnthropicCallResult> {
  const chunks: string[] = [];
  let messageId: string | undefined;
  let model: string | undefined;
  let usage: AnthropicCallResult['usage'];
  let error: string | undefined;
  let completed = false;
  for (const line of raw.split('\n')) {
    let event: any;
    try { event = JSON.parse(line); } catch { continue; }
    if (provider === 'codex') {
      if (event.type === 'thread.started') messageId = event.thread_id;
      if (event.type === 'item.completed' && event.item?.type === 'agent_message') chunks.push(event.item.text || '');
      if (event.type === 'error' || event.type === 'turn.failed') error = 'Codex session reported an execution error';
      if (event.type === 'turn.completed') {
        completed = true;
        const input = event.usage?.input_tokens; const output = event.usage?.output_tokens;
        if (Number.isFinite(input) && Number.isFinite(output)) usage = { inputTokens: input, outputTokens: output, totalTokens: input + output };
      }
    } else {
      if (event.session_id) messageId = event.session_id;
      if (event.message?.model) model = event.message.model;
      if (event.type === 'result') {
        completed = event.subtype === 'success' && !event.is_error;
        if (!completed) error = 'Claude session reported an unsuccessful final result';
        else if (typeof event.result === 'string') chunks.push(event.result);
        const input = event.usage?.input_tokens; const output = event.usage?.output_tokens;
        if (Number.isFinite(input) && Number.isFinite(output)) usage = { inputTokens: input, outputTokens: output, totalTokens: input + output };
      }
    }
  }
  if (!completed && !error) error = 'CLI session did not emit a successful final event';
  return { output: chunks.join('\n'), messageId, model, usage, ...(error ? { error } : {}) };
}

export async function callCliSession(provider: SessionProvider, input: AnthropicCallInput): Promise<AnthropicCallResult> {
  const started = Date.now();
  const mode = process.env.RUFLO_SESSION_MODE || 'read-only';
  if (!['read-only', 'workspace-write'].includes(mode)) return { success: false, error: 'RUFLO_SESSION_MODE must be read-only or workspace-write' };
  if (!(await sessionAuthenticated(provider))) return { success: false, error: `${provider} subscription login is required. Run ${provider === 'codex' ? 'codex login' : 'claude auth login'}; API-key authentication is not accepted in session mode.`, durationMs: Date.now() - started };
  // The independent override permits CLI work beyond Ruflo's legacy 45s
  // default while retaining a hard five-minute process limit.
  const requestedTimeout = process.env.RUFLO_SESSION_TIMEOUT_MS !== undefined
    ? Number(process.env.RUFLO_SESSION_TIMEOUT_MS) : input.timeoutMs;
  const timeoutMs = Number.isFinite(requestedTimeout) && requestedTimeout! > 0
    ? Math.min(300_000, requestedTimeout!) : 300_000;
  return new Promise(resolve => {
    let stdout = ''; let stderrSize = 0; let settled = false;
    const decoder = new StringDecoder('utf8');
    const child = spawn(provider, sessionArguments(provider, getProjectCwd(), mode === 'workspace-write'), {
      cwd: getProjectCwd(), env: sessionEnvironment(), shell: false, detached: process.platform !== 'win32', stdio: ['pipe', 'pipe', 'pipe'],
    });
    const kill = () => { try { if (child.pid && process.platform !== 'win32') process.kill(-child.pid, 'SIGKILL'); else child.kill('SIGKILL'); } catch { /* already exited */ } };
    const finish = (result: AnthropicCallResult) => { if (settled) return; settled = true; clearTimeout(timer); resolve({ ...result, durationMs: Date.now() - started }); };
    const timer = setTimeout(() => { kill(); finish({ success: false, error: `${provider} login-session execution timed out after ${timeoutMs}ms` }); }, timeoutMs);
    const collect = (kind: 'out' | 'err', data: Buffer) => {
      if (kind === 'out') stdout += decoder.write(data); else stderrSize += data.length;
      if (stdout.length + stderrSize > 8_000_000) { kill(); finish({ success: false, error: 'CLI session output exceeded 8 MB limit' }); }
    };
    child.stdout.on('data', data => collect('out', data)); child.stderr.on('data', data => collect('err', data));
    child.on('error', () => finish({ success: false, error: `${provider} CLI could not start. Install it and verify subscription login.` }));
    child.on('close', code => {
      stdout += decoder.end();
      const parsed = parseSessionOutput(provider, stdout);
      if (code !== 0 || parsed.error) {
        finish({ success: false, messageId: parsed.messageId, usage: parsed.usage, error: `${provider} login-session execution failed (exit ${code ?? 'unknown'}). Verify subscription login and CLI version. ${parsed.error || ''}` });
      } else if (!parsed.output) finish({ success: false, error: `${provider} CLI returned no final response; verify CLI login and supported JSON output` });
      else finish({ ...parsed, success: true, stopReason: 'end_turn' });
    });
    child.stdin.on('error', () => { /* process close/error supplies result */ });
    child.stdin.end(input.systemPrompt ? `${input.systemPrompt}\n\n${input.prompt}` : input.prompt);
  });
}
