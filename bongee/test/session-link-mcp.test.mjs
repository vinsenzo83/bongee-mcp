import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,realpath,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';

test('two real MCP proxies discover each other and aggregate explicit work without BATON connectivity',{timeout:45000},async()=>{
 const root=await realpath(await mkdtemp(join(tmpdir(),'bongee-link-mcp-'))),clients=[];
 const invoke=async(c,name,args={})=>{const r=await c.callTool({name,arguments:args});assert.notEqual(r.isError,true,r.content?.[0]?.text);return JSON.parse(r.content[0].text);};
 try{
  for(const name of ['claude-fixture','codex-fixture']){
   const c=new Client({name,version:'1.0.0'});clients.push(c);
   const t=new StdioClientTransport({command:process.execPath,args:[fileURLToPath(new URL('../proxy-server.mjs',import.meta.url))],env:{...process.env,BONGEE_SESSION_STATE_DIR:join(root,name),BONGEE_SESSION_LINK_ROOT:join(root,'shared'),BONGEE_BATON_URL:'http://127.0.0.1:1/mcp'},stderr:'pipe'});
   t.stderr?.on('data',()=>{});await c.connect(t);assert.equal(c.getServerVersion().version,'0.4.1');
  }
  const [a,b]=clients;
  const names=(await a.listTools()).tools.map(t=>t.name);
  for(const n of ['connect','peers','send','inbox','report','board'])assert.ok(names.includes('bongee_session_'+n));
  assert.equal((await invoke(a,'bongee_baton_status')).connected,false);
  const ia=(await invoke(a,'bongee_session_connect',{name:'기획 Claude',provider:'claude'})).endpoint;
  const ib=(await invoke(b,'bongee_session_connect',{name:'개발 Codex',provider:'codex'})).endpoint;
  assert.ok((await invoke(a,'bongee_session_peers')).peers.some(p=>p.id===ib.id));
  await invoke(a,'bongee_session_send',{to:ib.id,text:'Synthetic review request',requestId:'test-request'});
  const inbox=await invoke(b,'bongee_session_inbox');assert.equal(inbox.messages.length,1);assert.equal(inbox.messages[0].untrusted,true);
  await invoke(a,'bongee_session_report',{taskId:'screen',title:'기획',status:'completed',summary:'Synthetic progress report',evidence:['fixture-only']});
  await invoke(b,'bongee_session_report',{taskId:'screen',title:'구현',status:'blocked',summary:'Synthetic blocked report',nextStep:'Wait for requirements'});
  const board=await invoke(a,'bongee_session_board');assert.equal(board.total,2);assert.equal(board.counts.completed,1);assert.equal(board.counts.blocked,1);assert.equal(board.untrusted,true);
  assert.ok(board.reports.every(r=>r.verification==='self-reported-not-independently-verified'));
  assert.notEqual(ia.id,ib.id);
 }finally{for(const c of clients.reverse())await c.close();await rm(root,{recursive:true,force:true});}
});
