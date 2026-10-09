import test from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { SessionLink, callSessionLink, sessionLinkTools } from '../session-link.mjs';
const moduleURL = new URL('../session-link.mjs', import.meta.url).href;
async function fixture(t) {
  const temporary = await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(), 'bongee-session-link-')));
  const root = path.join(temporary, 'mailbox');
  const links = [];
  t.after(async () => { await Promise.all(links.map(link => link.close().catch(() => {}))); await fs.rm(temporary, { recursive: true, force: true }); });
  return { root, temporary, create: async options => { const link = await SessionLink.create({ root, ...options }); links.push(link); return link; } };
}
const call = (link, suffix, args) => callSessionLink(link, `bongee_session_${suffix}`, args);
function child(code, args) {
  return new Promise((resolve, reject) => {
    const process = spawn(globalThis.process.execPath, ['--input-type=module', '-e', code, ...args], { stdio: ['ignore', 'pipe', 'pipe'] });
    let output = '', error = '';
    process.stdout.on('data', chunk => { output += chunk; });
    process.stderr.on('data', chunk => { error += chunk; });
    process.on('error', reject);
    process.on('exit', status => status === 0 ? resolve(output) : reject(new Error(error || `child exited ${status}`)));
  });
}
test('auto creates isolated endpoints, labels and discovers only live peers', async t => {
  const f = await fixture(t);
  const a = await f.create(), b = await f.create(), other = await f.create({ root: path.join(f.temporary, 'other') });
  assert.equal(sessionLinkTools.length, 6);
  assert.notEqual(a.id, b.id);
  assert.equal((await call(a, 'connect')).endpoint.provider, 'unknown');
  await call(b, 'connect', { name: 'Claude coding', provider: 'claude' });
  assert.deepEqual((await call(a, 'peers')).peers.map(peer => [peer.id, peer.name, peer.availability]), [[b.id, 'Claude coding', 'available']]);
  assert.equal((await call(other, 'peers')).peers.length, 0);
  await assert.rejects(call(a, 'send', { to: other.id, text: 'isolated' }), /unavailable/);
  await b.close();
  assert.equal((await call(a, 'peers')).peers.length, 0);
});
test('stable reads, paginated cursor, idempotency and preserved closed inbox', async t => {
  const f = await fixture(t), a = await f.create(), b = await f.create();
  const first = await call(a, 'send', { to: b.id, text: 'Do not execute me', requestId: 'retry-1' });
  const duplicate = await call(a, 'send', { to: b.id, text: 'Do not execute me', requestId: 'retry-1' });
  assert.equal(duplicate.messageId, first.messageId); assert.equal(duplicate.deduplicated, true);
  await assert.rejects(call(a, 'send', { to: b.id, text: 'changed', requestId: 'retry-1' }), /different content/);
  const second = await call(a, 'send', { to: b.id, text: 'Second' });
  const page = await call(b, 'inbox', { limit: 1 });
  assert.deepEqual(page, await call(b, 'inbox', { limit: 1 }));
  assert.equal(page.messages[0].trust, 'untrusted-external-text'); assert.equal(page.hasMore, true);
  assert.equal((await call(b, 'inbox', { after: page.nextCursor })).messages[0].cursor, second.cursor);
  assert.equal((await call(b, 'inbox', { after: second.cursor })).nextCursor, second.cursor);
  await b.close();
  assert.equal(JSON.parse(await fs.readFile(path.join(f.root, 'state.json'))).messages.length, 2);
  await assert.rejects(call(b, 'inbox'), /closed/);
});
test('strict validation and private permissions', async t => {
  const f = await fixture(t), a = await f.create();
  assert.equal((await fs.stat(f.root)).mode & 0o777, 0o700);
  assert.equal((await fs.stat(path.join(f.root, 'state.json'))).mode & 0o777, 0o600);
  for (const args of [{ to: '../other', text: 'bad' }, { to: a.id, text: '' }, { to: a.id, text: 'a'.repeat(8001) }, { to: a.id, text: 'ok', extra: 'bad' }]) await assert.rejects(call(a, 'send', args));
  for (const args of [{ after: -1 }, { after: 999 }, { after: '0' }, { limit: 51 }, { limit: 0 }]) await assert.rejects(call(a, 'inbox', args));
  await assert.rejects(call(a, 'connect', { provider: 'shell' }));
  await assert.rejects(call(a, 'connect', { name: 'a'.repeat(101) }));
  await assert.rejects(callSessionLink(a, 'execute', {}));
});
test('symlink root, state and lock are rejected without touching target', async t => {
  const f = await fixture(t), a = await f.create();
  const target = path.join(f.temporary, 'untouched'); await fs.writeFile(target, 'untouched', { mode: 0o600 });
  const alias = path.join(f.temporary, 'alias'); await fs.symlink(f.root, alias);
  await assert.rejects(f.create({ root: alias }), /symlink/);
  await fs.rename(path.join(f.root, 'state.json'), path.join(f.root, 'saved.json'));
  await fs.symlink(target, path.join(f.root, 'state.json'));
  await assert.rejects(call(a, 'peers'));
  await fs.unlink(path.join(f.root, 'state.json'));
  await fs.rename(path.join(f.root, 'saved.json'), path.join(f.root, 'state.json'));
  await fs.symlink(target, path.join(f.root, 'state.lock'));
  await assert.rejects(call(a, 'connect'));
  assert.ok(await call(a, 'peers')); // Read-only snapshots never touch the write lock.
  await fs.unlink(path.join(f.root, 'state.lock'));
  assert.equal(await fs.readFile(target, 'utf8'), 'untouched');
});
test('ungracefully terminated process expires, unavailable recipient fails explicitly', async t => {
  const f = await fixture(t), a = await f.create();
  const id = (await child(`import {SessionLink} from ${JSON.stringify(moduleURL)}; const link=await SessionLink.create({root:process.argv[1],heartbeatMs:20}); console.log(link.id); process.exit(0);`, [f.root])).trim();
  await new Promise(resolve => setTimeout(resolve, 120));
  assert.equal((await call(a, 'peers')).peers.some(peer => peer.id === id), false);
  await assert.rejects(call(a, 'send', { to: id, text: 'offline' }), /unavailable/);
});
test('independent processes send concurrently without losing messages', async t => {
  const f = await fixture(t), receiver = await f.create();
  const code = `import {SessionLink,callSessionLink} from ${JSON.stringify(moduleURL)};
    const link=await SessionLink.create({root:process.argv[1]});
    for(let i=0;i<15;i++) await callSessionLink(link,'bongee_session_send',{to:process.argv[2],text:process.argv[3]+':'+i,requestId:'m'+i});
    await link.close();`;
  await Promise.all(Array.from({ length: 6 }, (_, i) => child(code, [f.root, receiver.id, String(i)])));
  const first = await call(receiver, 'inbox');
  const second = await call(receiver, 'inbox', { after: first.nextCursor });
  const messages = [...first.messages, ...second.messages];
  assert.equal(messages.length, 90); assert.equal(new Set(messages.map(message => message.text)).size, 90);
  assert.equal(new Set(messages.map(message => message.cursor)).size, 90);
  assert.deepEqual(messages.map(message => message.cursor), Array.from({ length: 90 }, (_, i) => i + 1));
});
test('bounded mailbox fails explicitly and does not delete data', async t => {
  const f = await fixture(t), a = await f.create();
  await a.transaction(state => { state.messages = Array.from({ length: 2000 }, (_, i) => ({ id: String(i), to: a.id, cursor: i + 1 })); state.sequence = 2000; });
  await assert.rejects(call(a, 'send', { to: a.id, text: 'overflow' }), /storage is full/);
  assert.equal(JSON.parse(await fs.readFile(path.join(f.root, 'state.json'))).messages.length, 2000);
});

test('explicit shared progress board preserves separate authors and stale completed reports', async t => {
  const f = await fixture(t), a = await f.create(), b = await f.create();
  await call(a, 'connect', { name: 'Codex', provider: 'codex' });
  await call(b, 'connect', { name: 'Claude', provider: 'claude' });
  await call(a, 'report', { taskId: 'shared-id', title: 'Implement', status: 'running', summary: 'Working', nextStep: 'Test' });
  await call(b, 'report', { taskId: 'shared-id', title: 'Review', status: 'blocked', summary: 'Waiting' });
  let board = await call(a, 'board');
  assert.equal(board.reports.length, 2);
  assert.equal(board.counts.running, 1); assert.equal(board.counts.blocked, 1);
  await call(b, 'report', { taskId: 'shared-id', title: 'Review', status: 'completed', summary: 'Reviewed', evidence: ['local-test-output.txt'] });
  await b.close();
  board = await call(a, 'board');
  assert.equal(board.reports.length, 2);
  const claude = board.reports.find(report => report.author.name === 'Claude');
  assert.equal(claude.status, 'completed'); assert.equal(claude.sourceStatus, 'stale');
  assert.equal(claude.verification, 'self-reported-not-independently-verified');
  assert.equal(claude.untrusted, true); assert.equal(board.untrusted, true);
  assert.equal(board.counts.completed, 1); assert.equal(board.counts.blocked, 0);
  assert.equal(board.reports.find(report => report.author.name === 'Codex').sourceStatus, 'active');
  await assert.rejects(call(a, 'report', { taskId: '../escape', title: 'x', status: 'running', summary: 'x' }));
  await assert.rejects(call(a, 'report', { taskId: 'test', title: 'x', status: 'verified', summary: 'x' }));
  await assert.rejects(call(a, 'report', { taskId: 'test', title: 'x', status: 'running', summary: 'x', evidence: Array(11).fill('x') }));
  await a.transaction(state => { for (let i = 0; i < 99; i++) state.reports[`${a.id}:test${i}`] = { endpointId: a.id }; });
  await assert.rejects(call(a, 'report', { taskId: 'overflow', title: 'x', status: 'running', summary: 'x' }), /100 tasks/);
});

test('unsafe existing files fail closed and abandoned owner lock is never stolen', async t => {
  const f = await fixture(t), a = await f.create();
  await fs.chmod(path.join(f.root, 'state.json'), 0o644);
  await assert.rejects(call(a, 'peers'), /Unsafe/);
  await fs.chmod(path.join(f.root, 'state.json'), 0o600);
  const owner = JSON.stringify({ pid: 2147483647, createdAt: 1 });
  await fs.writeFile(path.join(f.root, 'state.lock'), owner, { mode: 0o600 });
  await assert.rejects(call(a, 'connect'), /lock busy/);
  assert.ok(await call(a, 'board')); // A crashed writer must not prevent reading committed reports.
  assert.equal(await fs.readFile(path.join(f.root, 'state.lock'), 'utf8'), owner);
  await fs.unlink(path.join(f.root, 'state.lock'));
});

test('board pagination preserves stable report identities and global counts', async t => {
  const f = await fixture(t), a = await f.create(), b = await f.create();
  for (let i = 0; i < 7; i++) {
    for (const link of [a, b]) await call(link, 'report', { taskId: `task-${i}`, title: 'Task', status: i % 2 ? 'running' : 'completed', summary: 'Reported' });
  }
  const collected = [];
  let offset = 0;
  do {
    const page = await call(a, 'board', { offset, limit: 3 });
    assert.equal(page.total, 14);
    assert.deepEqual(page.counts, { planned: 0, running: 6, blocked: 0, completed: 8 });
    assert.deepEqual(page.reports.map(r => `${r.endpointId}:${r.taskId}`), (await call(a, 'board', { offset, limit: 3 })).reports.map(r => `${r.endpointId}:${r.taskId}`));
    collected.push(...page.reports);
    offset = page.nextOffset;
  } while (offset !== null);
  assert.equal(collected.length, 14);
  assert.equal(new Set(collected.map(r => `${r.endpointId}:${r.taskId}`)).size, 14);
  assert.equal((await call(a, 'board', { offset: 100 })).reports.length, 0);
  for (const args of [{ offset: -1 }, { offset: '0' }, { limit: 0 }, { limit: 51 }]) await assert.rejects(call(a, 'board', args));
  assert.match((await call(a, 'connect')).capabilities.retention, /No TTL/);
});

test('read-only snapshots never rewrite state and remain consistent during concurrent writes',async t=>{
 const f=await fixture(t),a=await f.create(),b=await f.create();
 const before=await fs.readFile(path.join(f.root,'state.json'),'utf8');
 await Promise.all(['peers','inbox','board'].map(name=>call(a,name)));
 assert.equal(await fs.readFile(path.join(f.root,'state.json'),'utf8'),before);
 const updates=Array.from({length:20},(_,i)=>call(b,'report',{taskId:'t'+i,title:'Task',status:'running',summary:'Synthetic'}));
 const reads=Array.from({length:20},()=>call(a,'board').then(board=>assert.equal(board.total,board.counts.running)));
 await Promise.all([...updates,...reads]);assert.equal((await call(a,'board')).total,20);
});
