import { describe, it, expect } from 'vitest';
import { sessionEnvironment, sessionArguments, parseSessionOutput } from '../src/mcp-tools/cli-session-provider.js';

describe('CLI login-session provider', () => {
  it('inherits only session location and process basics, never API credentials', () => {
    expect(sessionEnvironment({ HOME: '/home/test', PATH: '/bin', OPENAI_API_KEY: 'secret', ANTHROPIC_API_KEY: 'secret', ANTHROPIC_AUTH_TOKEN: 'secret', CLAUDECODE: '1' })).toEqual({ HOME: '/home/test', PATH: '/bin' });
  });
  it('defaults to sandboxed Codex without inherited configuration or model routing', () => {
    const args = sessionArguments('codex', '/tmp/project', false);
    expect(args).toEqual(['exec', '--ignore-user-config', '--json', '--skip-git-repo-check', '--sandbox', 'read-only', '-C', '/tmp/project', '-']);
    expect(sessionArguments('codex', '/tmp/project', true)).toContain('workspace-write');
  });
  it('restricts Claude MCP and tools without disabling login credentials', () => {
    const read = sessionArguments('claude', '/tmp', false);
    expect(read).toContain('{"mcpServers":{}}');
    expect(read).toContain('Read,Glob,Grep');
    expect(read).not.toContain('--bare');
    expect(read).not.toContain('--dangerously-skip-permissions');
    expect(read).toContain('--safe-mode');
    expect(read).toContain('--permission-mode');
    expect(sessionArguments('claude', '/tmp', true)).toContain('Read,Glob,Grep,Edit,Write');
  });
  it('parses Codex response and actual usage without inventing model or price', () => {
    const result = parseSessionOutput('codex', [
      JSON.stringify({ type: 'thread.started', thread_id: 't1' }),
      JSON.stringify({ type: 'item.completed', item: { type: 'agent_message', text: 'done' } }),
      JSON.stringify({ type: 'turn.completed', usage: { input_tokens: 10, output_tokens: 2 } }),
    ].join('\n'));
    expect(result.output).toBe('done'); expect(result.messageId).toBe('t1');
    expect(result.usage).toEqual({ inputTokens: 10, outputTokens: 2, totalTokens: 12 });
    expect(result.model).toBeUndefined();
  });
  it('preserves absent usage and Claude session errors', () => {
    const result = parseSessionOutput('claude', JSON.stringify({ type: 'result', session_id: 'c1', is_error: true, result: 'Please login' }));
    expect(result.error).toBe('Claude session reported an unsuccessful final result'); expect(result.usage).toBeUndefined();
  });
  it('requires successful final events and never returns raw CLI errors', () => {
    expect(parseSessionOutput('codex', JSON.stringify({ type: 'item.completed', item: { type: 'agent_message', text: 'partial' } })).error).toBeTruthy();
    expect(parseSessionOutput('claude', JSON.stringify({ type: 'result', subtype: 'success', result: 'done' })).error).toBeUndefined();
    const error = parseSessionOutput('codex', [JSON.stringify({ type: 'error', message: 'credential secret' }), JSON.stringify({ type: 'turn.completed' })].join('\n')).error;
    expect(error).toBeTruthy(); expect(error).not.toContain('secret');
  });
});
