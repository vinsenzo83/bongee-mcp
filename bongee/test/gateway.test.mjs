import test from 'node:test';
import assert from 'node:assert/strict';
import {createGateway} from '../gateway.mjs';
import {GatewayRunner} from '../runner.mjs';

const token='integration-test-token-1234567890123456789';
async function fixture(t){const gateway=createGateway({token});const server=await new Promise((resolve,reject)=>{const s=gateway.app.listen(0,'127.0.0.1',error=>error?reject(error):resolve(s));s.on('error',reject);});t.after(()=>new Promise(r=>server.close(r)));const url='http://127.0.0.1:'+server.address().port;const request=async(path,body,authorized=true)=>fetch(url+path,{method:body===undefined?'GET':'POST',headers:{...(authorized?{Authorization:'Bearer '+token}:{}),'Content-Type':'application/json'},...(body!==undefined?{body:JSON.stringify(body)}:{})});const mcp=async(name,args={})=>{const response=await fetch(url+'/mcp',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json',Accept:'application/json, text/event-stream'},body:JSON.stringify({jsonrpc:'2.0',id:1,method:'tools/call',params:{name,arguments:args}})});assert.equal(response.status,200);const body=await response.json();return body.result;};return {...gateway,url,request,mcp};}
test('network MCP requires authentication and rejects disconnected runner',async t=>{const {request,mcp}=await fixture(t);assert.equal((await request('/health',undefined,false)).status,200);assert.equal((await request('/runner/claim',{},false)).status,401);assert.equal((await request('/mcp',{},false)).status,401);const result=await mcp('agent_start',{provider:'codex',prompt:'test',cwd:'/tmp'});assert.equal(result.isError,true);assert.match(result.content[0].text,/disconnected/);});
test('real HTTP runner completes and cancels jobs; claim cannot duplicate',async t=>{const {url,request,mcp}=await fixture(t);const localJobs=new Map();let count=0;const manager={ready:Promise.resolve(),running:new Map(),providerStatus:async()=>[{provider:'codex',available:true,authenticated:true}],async start(input){const id='local-'+(++count),job={id,status:'running',output:'',provider:input.provider};localJobs.set(id,job);this.running.set(id,job);return job;},result:id=>localJobs.get(id),async cancel(id){localJobs.get(id).status='cancelled';this.running.delete(id);},async shutdown(){}};const runner=new GatewayRunner({url,token,manager});await runner.tick();const start=await mcp('agent_start',{provider:'codex',prompt:'test',cwd:'/tmp'});const id=JSON.parse(start.content[0].text).id;await runner.tick();assert.equal(count,1);assert.equal((await (await request('/runner/claim',{})).json()).job,null);const local=localJobs.get('local-1');local.status='completed';local.output='done';manager.running.delete('local-1');await runner.tick();assert.equal(JSON.parse((await mcp('agent_result',{id})).content[0].text).output,'done');const next=JSON.parse((await mcp('agent_start',{provider:'codex',prompt:'second',cwd:'/tmp'})).content[0].text);await runner.tick();await mcp('agent_cancel',{id:next.id});await runner.tick();assert.equal(JSON.parse((await mcp('agent_status',{id:next.id})).content[0].text).status,'cancelled');});
test('bounds, wrong lease and secrets are enforced over HTTP',async t=>{const {request,mcp}=await fixture(t);await request('/runner/heartbeat',{providers:[{provider:'codex',available:true,authenticated:true}]});const invalid=await mcp('agent_start',{provider:'codex',prompt:'x',cwd:'relative'});assert.equal(invalid.isError,true);const ids=[];for(let i=0;i<20;i++){const result=await mcp('agent_start',{provider:'codex',prompt:'private prompt',cwd:'/tmp'});ids.push(JSON.parse(result.content[0].text).id);}assert.equal((await mcp('agent_start',{provider:'codex',prompt:'x',cwd:'/tmp'})).isError,true);const claim=await (await request('/runner/claim',{})).json();assert.equal((await request('/runner/report/'+claim.job.id,{lease:'wrong',status:'completed'})).status,409);const list=await mcp('agent_list');assert.equal(list.content[0].text.includes('private prompt'),false);assert.equal(list.content[0].text.includes(token),false);assert.equal((await request('/runner/report/'+claim.job.id,{lease:claim.job.lease,status:'completed',output:'x'.repeat(70000)})).status,200);assert.equal(JSON.parse((await mcp('agent_result',{id:claim.job.id})).content[0].text).output.length,65536);});
test('full catalog forwarding preserves original MCP content across HTTP queue',async t=>{const {url,request,mcp}=await fixture(t);let received;const tools=[{name:'original_status',description:'Original status tool',inputSchema:{type:'object',properties:{}}}];const toolClient={listTools:async()=>({tools}),callTool:async input=>{received=input;return {content:[{type:'text',text:'original full-tool response'}]};}};const manager={ready:Promise.resolve(),running:new Map(),providerStatus:async()=>[],shutdown:async()=>{}};const runner=new GatewayRunner({url,token,manager,toolClient});await runner.tick();const response=fetch(url+'/mcp',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json',Accept:'application/json, text/event-stream'},body:JSON.stringify({jsonrpc:'2.0',id:2,method:'tools/list',params:{}})});const catalog=(await (await response).json()).result.tools;assert.equal(catalog.length,8);assert.ok(catalog.some(t=>t.name==='bongee_auto_setup'));assert.equal(catalog[0].name,'original_status');assert.ok(catalog.some(t=>t.name==='bongee_remote_agent_start'));const resultPromise=mcp('original_status',{detail:true});for(let i=0;i<50;i++){await new Promise(r=>setTimeout(r,10));await runner.tick();if(received)break;}await runner.tick();const result=await resultPromise;assert.deepEqual(received,{name:'original_status',arguments:{detail:true}});assert.equal(result.content[0].text,'original full-tool response');assert.equal((await request('/runner/heartbeat',{catalog:[{name:'bad',inputSchema:null}]})).status,400);});
test('364-tool catalog and large RPC results cross former 150KB body boundary',async t=>{const {request,mcp}=await fixture(t);const catalog=Array.from({length:364},(_,i)=>({name:'full_tool_'+i,description:'d'.repeat(600),inputSchema:{type:'object',properties:{}}}));assert.ok(JSON.stringify(catalog).length>150000);assert.equal((await request('/runner/heartbeat',{catalog})).status,200);const pending=mcp('full_tool_0',{});let job;for(let i=0;i<50;i++){await new Promise(r=>setTimeout(r,10));job=(await (await request('/runner/claim',{})).json()).job;if(job)break;}assert.ok(job);const rpcResult={content:[{type:'text',text:'r'.repeat(1200000)}]};assert.equal((await request('/runner/report/'+job.id,{lease:job.lease,status:'completed',rpcResult})).status,200);assert.equal((await pending).content[0].text.length,1200000);assert.equal((await request('/runner/heartbeat',{catalog:catalog.map(t=>({...t,description:'x'.repeat(3000)}))})).status,400);});
test('slow provider refresh does not delay runner heartbeat',async t=>{const {url}=await fixture(t);let checks=0;const manager={ready:Promise.resolve(),running:new Map(),providerStatus:()=>{checks++;return checks===1?Promise.resolve([]):new Promise(()=>{});},shutdown:async()=>{}};const runner=new GatewayRunner({url,token,manager});await runner.tick();runner.providersFetchedAt=0;await runner.tick();assert.equal(checks,2);await runner.tick();assert.equal(checks,2);});
test('remote role metadata survives queue and claim without leaking prompt',async t=>{const {request,mcp}=await fixture(t);await request('/runner/heartbeat',{providers:[{provider:'codex',available:true,authenticated:true}]});const result=JSON.parse((await mcp('bongee_remote_agent_start',{provider:'codex',cwd:'/tmp',prompt:'private prompt',role:'planner',name:'기획',phase:'planning'})).content[0].text);assert.equal(result.phase,'planning');assert.equal(result.role,'planner');assert.equal(JSON.stringify(result).includes('private prompt'),false);const claim=(await (await request('/runner/claim',{})).json()).job;assert.equal(claim.input.role,'planner');assert.equal(claim.input.name,'기획');assert.equal(claim.input.phase,'planning');assert.equal((await mcp('bongee_remote_agent_start',{provider:'codex',cwd:'/tmp',prompt:'x',role:'bad\x1b[2J'})).isError,true);});

test('terminal report retries acknowledge the same private lease without changing results',async t=>{
 const {request,mcp}=await fixture(t);
 await request('/runner/heartbeat',{providers:[{provider:'codex',available:true,authenticated:true}]});
 await mcp('agent_start',{provider:'codex',prompt:'test',cwd:'/tmp'});
 const {job}=await (await request('/runner/claim',{})).json();
 const report={lease:job.lease,status:'completed',output:'original'};
 assert.equal((await request('/runner/report/'+job.id,report)).status,200);
 assert.equal((await request('/runner/report/'+job.id,{...report,output:'overwrite'})).status,200);
 assert.equal((await request('/runner/report/'+job.id,{...report,lease:'wrong'})).status,409);
 const result=JSON.parse((await mcp('agent_result',{id:job.id})).content[0].text);
 assert.equal(result.output,'original');
 for(const name of ['agent_result','agent_status','agent_list'])assert.equal(JSON.stringify(await mcp(name,{id:job.id})).includes(job.lease),false);
});

const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return {promise,resolve,reject};};
async function rpcRunner(){
 const tool=deferred(),reports=[],reported=deferred();let calls=0,claim=true,failReport=false,cancel=false;
 const manager={ready:Promise.resolve(),running:new Map(),providerStatus:async()=>[],shutdown:async()=>{}};
 const runner=new GatewayRunner({url:'http://127.0.0.1',token,manager,toolClient:{listTools:async()=>({tools:[]}),callTool:()=>{calls++;return tool.promise;}}});
 runner.request=async(path,body)=>{
  if(path==='/runner/heartbeat')return {ok:true};
  if(path==='/runner/claim'){if(!claim)return {job:null};claim=false;return {job:{id:'rpc',kind:'rpc',lease:'lease',input:{name:'status',arguments:{}}}};}
  if(path==='/runner/control/rpc')return {cancelRequested:cancel};
  if(path==='/runner/report/rpc'){reports.push(body);reported.resolve();if(failReport)throw Error('network failure');return {ok:true};}
  throw Error('Unexpected path');
 };
 await runner.tick();
 return {runner,tool,reports,reported,calls:()=>calls,setFailure:value=>{failReport=value;},cancel:()=>{cancel=true;}};
}
test('RPC completion reports immediately without another tick, retaining failed reports for retry',async()=>{
 const f=await rpcRunner();f.setFailure(true);
 f.tool.resolve({content:[{type:'text',text:'finished'}]});
 await f.reported.promise;await new Promise(r=>setImmediate(r));
 assert.equal(f.reports.length,1);assert.equal(f.runner.rpcJobs.size,1);
 f.setFailure(false);await f.runner.tick();
 assert.equal(f.reports.length,2);assert.deepEqual(f.reports[0],f.reports[1]);
 assert.equal(f.runner.rpcJobs.size,0);assert.equal(f.calls(),1);
});
test('RPC completion checks cancellation and serializes concurrent tick reports',async()=>{
 const f=await rpcRunner(),control=deferred();const request=f.runner.request.bind(f.runner);
 let checks=0;f.runner.request=async(path,body)=>{if(path==='/runner/control/rpc'){checks++;return control.promise;}return request(path,body);};
 f.tool.resolve({content:[{type:'text',text:'finished'}]});
 await new Promise(r=>setImmediate(r));const tick=f.runner.tick();await new Promise(r=>setImmediate(r));
 assert.equal(checks,1);control.resolve({cancelRequested:true});await tick;
 assert.equal(f.reports.length,1);assert.equal(f.reports[0].status,'cancelled');
 assert.equal(f.reports[0].rpcResult.isError,true);assert.equal(f.runner.rpcJobs.size,0);
});
test('RPC rejection reports immediately as failed without a polling tick',async()=>{
 const f=await rpcRunner();f.tool.reject(Error('private provider error'));
 await f.reported.promise;await new Promise(r=>setImmediate(r));
 assert.equal(f.reports[0].status,'failed');assert.equal(f.runner.rpcJobs.size,0);
 assert.equal(JSON.stringify(f.reports).includes('private provider error'),false);
});
test('lost HTTP report acknowledgement retries without rerunning the tool or leaking a slot',{timeout:5000},async t=>{
 const gateway=await fixture(t);let calls=0,lost=false;
 const toolClient={listTools:async()=>({tools:[{name:'instant_status',inputSchema:{type:'object'}}]}),callTool:async()=>{calls++;return {content:[{type:'text',text:'done'}]};}};
 const manager={ready:Promise.resolve(),running:new Map(),providerStatus:async()=>[],shutdown:async()=>{}};
 const runner=new GatewayRunner({url:gateway.url,token,manager,toolClient});
 const request=runner.request.bind(runner);
 runner.request=async(path,body)=>{const result=await request(path,body);if(path.startsWith('/runner/report/')&&!lost){lost=true;throw Error('HTTP acknowledgement lost');}return result;};
 await runner.tick();const pending=gateway.call('instant_status');await runner.tick();
 const result=await pending;
 assert.equal(result.__rpcResult.content[0].text,'done');
 assert.equal(runner.rpcJobs.size,1);assert.equal(calls,1);
 await runner.tick();assert.equal(runner.rpcJobs.size,0);assert.equal(calls,1);
});
