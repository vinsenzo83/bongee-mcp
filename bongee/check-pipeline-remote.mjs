import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StreamableHTTPClientTransport} from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {join} from 'node:path';import {homedir} from 'node:os';
const base='/Users/vinsenzo/output/bongee-mcp',cwd=base+'/pipeline-remote-demo';
await mkdir(cwd,{recursive:true});
await writeFile(cwd+'/package.json',JSON.stringify({private:true,type:'module',scripts:{test:'node --test'}}));
await writeFile(cwd+'/acceptance.test.mjs',`import test from 'node:test';import assert from 'node:assert/strict';import {draw} from './draw.mjs';
test('select one supplied entry',()=>assert.ok(['a','b'].includes(draw(['a','b']))));
test('singleton unchanged',()=>assert.equal(draw(['a']),'a'));
test('invalid inputs rejected',()=>{for(const x of [[],null,{},[''],[' '],[1],['a',null]])assert.throws(()=>draw(x));});\n`);
const marker=base+'/pipeline-injection-'+Date.now()+'.txt',checker=base+'/pipeline-injection-'+Date.now()+'.mjs';
await writeFile(checker,`import{readFile,writeFile}from'node:fs/promises';import{spawnSync}from'node:child_process';const cwd=process.argv[2],marker=process.argv[3];let injected=false;try{await readFile(marker);}catch{await writeFile(marker,'injected once');await writeFile(cwd+'/draw.mjs',"export function draw(){return '__injected_defect__';}\\n");injected=true;}const r=spawnSync(process.execPath,['--test'],{cwd,encoding:'utf8'});console.log(injected?'CONTROLLED SOURCE DEFECT INJECTED':'REVERIFICATION WITHOUT INJECTION');process.stdout.write(r.stdout||'');process.stderr.write(r.stderr||'');process.exitCode=r.status===null?1:r.status;`);
const cfg=JSON.parse(await readFile(join(homedir(),'.config/bongee/gateway.json'),'utf8'));
const client=new Client({name:'bongee-real-pipeline-check',version:'0.2.0'});
await client.connect(new StreamableHTTPClientTransport(new URL(cfg.url+'/mcp'),{requestInit:{headers:{Authorization:'Bearer '+cfg.token}}}));
const call=async(name,args)=>{const r=await client.callTool({name,arguments:args},undefined,{timeout:65000});if(r.isError)throw Error(r.content[0].text);let data=JSON.parse(r.content[0].text);while(data.pending){await new Promise(r=>setTimeout(r,1000));const pending=await client.callTool({name:'bongee_remote_agent_result',arguments:{id:data.id}});const j=JSON.parse(pending.content[0].text);if(j.rpcResult){if(j.rpcResult.isError)throw Error(j.rpcResult.content[0].text);return JSON.parse(j.rpcResult.content[0].text);}if(['failed','cancelled'].includes(j.status))throw Error('Forwarded call '+j.status);}return data;};
try{
const catalog=(await client.listTools()).tools;if(!catalog.some(t=>t.name==='bongee_pipeline_start'))throw Error('Updated pipeline catalog unavailable');
const started=await call('bongee_pipeline_start',{cwd,provider:'codex',maxRepairRounds:3,stageTimeoutSeconds:600,checks:[{id:'real-acceptance',command:process.execPath,args:[checker,cwd,marker]}],request:'Implement dependency-free draw.mjs exporting draw(participants), random selection of exactly one supplied nonempty string. Reject empty or invalid input and invalid entries. Add README usage and meaningful tests. Preserve supplied tests. No UI needed. The external verification harness deliberately injects a source defect ONCE during first verification; after its actual failure repair draw.mjs then reverify. Do not change external checker or tests to bypass failures. Planner define at most 3 acceptance requirements for functionality, validation and docs/tests. Tester/reviewer findings must list unresolved issues only; successful evidence belongs in acceptance evidence, not findings.'});
console.log(JSON.stringify({id:started.id,cwd,toolCount:catalog.length}));let previous='';
while(true){const s=await call('bongee_pipeline_status',{id:started.id});const line=JSON.stringify({status:s.status,phase:s.currentPhase,round:s.round,roles:s.roles.map(r=>r.role+':'+r.status)});if(line!==previous){console.log(line);previous=line;}if(!['running','queued'].includes(s.status)){const result=await call('bongee_pipeline_result',{id:s.id});const monitor=await call('bongee_monitor_status',{cwd});await writeFile(base+'/pipeline-remote-results.json',JSON.stringify({toolCount:catalog.length,result,monitor},null,2));if(s.status!=='completed'||s.round<1||!result.verificationHistory.some(r=>r.receipt?.checks?.some(c=>c.status==='failed')))process.exitCode=1;break;}await new Promise(r=>setTimeout(r,2000));}
}finally{await client.close();}
