import express from 'express';
import {randomUUID,timingSafeEqual} from 'node:crypto';
import {Server} from '@modelcontextprotocol/sdk/server/index.js';
import {StreamableHTTPServerTransport} from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import {CallToolRequestSchema,ListToolsRequestSchema} from '@modelcontextprotocol/sdk/types.js';
import {pathToFileURL} from 'node:url';
import {validateLabels,phaseFor} from './monitor-state.mjs';

const schema=(properties={},required=[])=>({type:'object',properties,required,additionalProperties:false});
const idSchema=schema({id:{type:'string'}},['id']);
const tools=[{name:'provider_status',description:'로컬 실행기의 기존 CLI 로그인 상태',inputSchema:schema()},{name:'agent_start',description:'로컬 실행기에 역할별 에이전트 작업 전달. 기본 읽기 전용. role/name/phase는 4단계 모니터에 표시.',inputSchema:schema({provider:{type:'string',enum:['codex','claude']},prompt:{type:'string',minLength:1,maxLength:100000},cwd:{type:'string',minLength:1,maxLength:4096},role:{type:'string',maxLength:80},name:{type:'string',maxLength:80},phase:{type:'string',enum:['planning','design','development','verification']},mode:{type:'string',enum:['read-only','workspace-write'],default:'read-only'},timeoutSeconds:{type:'integer',minimum:1,maximum:600,default:180}},['provider','prompt','cwd'])},...['agent_status','agent_result','agent_cancel'].map(name=>({name,description:'로컬 에이전트 상태·결과·취소',inputSchema:idSchema})),{name:'agent_list',description:'현재 서버의 최근 작업 목록',inputSchema:schema()}];
export function createGateway({token=process.env.BONGEE_GATEWAY_TOKEN,clock=Date.now}={}){
 if(typeof token!=='string'||token.length<32)throw Error('BONGEE_GATEWAY_TOKEN must have at least 32 characters');
 const app=express(),jobs=new Map();let runner={lastSeen:0,providers:[],catalog:[]};
 app.use(express.json({limit:'16mb'}));app.get('/health',(_,res)=>res.json({ok:true,service:'bongee',runnerConnected:clock()-runner.lastSeen<15000&&runner.lastSeen>0,tools:runner.catalog.length+6}));
 app.get('/',(_,res)=>res.json({name:'bongee',mcp:'/mcp',remoteTools:runner.catalog.length+6,localRuflo:'Full local tool catalog is forwarded when runner is connected.',authentication:'Bearer gateway connection token required',state:'Server memory only; redeploy clears remote job records.'}));
 app.use((req,res,next)=>{const supplied=Buffer.from(req.headers.authorization||''),expected=Buffer.from('Bearer '+token);if(supplied.length!==expected.length||!timingSafeEqual(supplied,expected))return res.status(401).json({error:'Unauthorized'});next();});
 const connected=()=>runner.lastSeen>0&&clock()-runner.lastSeen<15000;
 const summary=j=>{const {input,output,finalResult,rpcResult,lease,...rest}=j;return rest;};
 const get=id=>{if(typeof id!=='string'||!jobs.has(id))throw Error('Unknown agent');return jobs.get(id);};
 const trim=()=>{for(const [id,j] of jobs){if(jobs.size<=100)break;if(!['queued','running'].includes(j.status))jobs.delete(id);}};
 const call=async(name,args={})=>{
  if(runner.catalog.some(t=>t.name===name)){
   if(!connected())throw Error('Local runner is disconnected');if(JSON.stringify(args).length>100000)throw Error('Tool arguments exceed size limit');if([...jobs.values()].filter(j=>['queued','running'].includes(j.status)).length>=20)throw Error('Agent queue is full');
   const job={id:randomUUID(),kind:'rpc',tool:name,status:'queued',startedAt:new Date(clock()).toISOString(),input:{name,arguments:args}};jobs.set(job.id,job);trim();
   const deadline=Date.now()+55000;while(['queued','running'].includes(job.status)&&Date.now()<deadline)await new Promise(r=>setTimeout(r,100));
   if(job.rpcResult)return {__rpcResult:job.rpcResult};if(job.status==='failed'||job.status==='cancelled')throw Error('Forwarded tool did not complete successfully');return {pending:true,id:job.id,status:job.status,message:'Use bongee_remote_agent_result to retrieve the forwarded result.'};
  }
  name=name.replace(/^bongee_remote_/,'');
  if(name==='provider_status')return {connected:connected(),providers:runner.providers};
  if(name==='agent_list')return [...jobs.values()].map(summary);
  if(name==='agent_start'){
   if(!connected())throw Error('Local runner is disconnected');
   const {provider,prompt,cwd,mode='read-only',timeoutSeconds=180}=args;const labels=validateLabels(args);
   if(!['codex','claude'].includes(provider)||!['read-only','workspace-write'].includes(mode)||typeof prompt!=='string'||!prompt.trim()||prompt.length>100000||typeof cwd!=='string'||!cwd.startsWith('/')||cwd.length>4096||!Number.isInteger(timeoutSeconds)||timeoutSeconds<1||timeoutSeconds>600)throw Error('Invalid agent input');
   if(!runner.providers.some(p=>p.provider===provider&&p.authenticated===true))throw Error('Provider CLI login is required');
   if([...jobs.values()].filter(j=>['queued','running'].includes(j.status)).length>=20)throw Error('Agent queue is full');
   const job={id:randomUUID(),status:'queued',provider,mode,cwd,...labels,phase:labels.phase||phaseFor(labels.role),startedAt:new Date(clock()).toISOString(),input:{provider,prompt,cwd,mode,timeoutSeconds,...labels}};jobs.set(job.id,job);trim();return summary(job);
  }
  const job=get(args.id);
  if(name==='agent_status')return summary(job);
  if(name==='agent_result'){const {input,lease,...result}=job;return result;}
  if(name==='agent_cancel'){if(job.status==='queued'){job.status='cancelled';delete job.input;}else if(job.status==='running')job.cancelRequested=true;return summary(job);}
  throw Error('Unknown tool');
 };
 app.post('/runner/heartbeat',(req,res)=>{const catalog=req.body?.catalog;if(catalog!==undefined&&(!Array.isArray(catalog)||catalog.length>1000||JSON.stringify(catalog).length>1000000||catalog.some(t=>typeof t.name!=='string'||!t.name.match(/^[\w.-]{1,100}$/)||!t.inputSchema||t.inputSchema.type!=='object')))return res.status(400).json({error:'Invalid tool catalog'});runner={lastSeen:clock(),catalog:catalog||runner.catalog,providers:['codex','claude'].map(provider=>({provider,available:req.body?.providers?.some(p=>p.provider===provider&&p.available===true)===true,authenticated:req.body?.providers?.some(p=>p.provider===provider&&p.authenticated===true)===true}))};res.json({ok:true});});
 app.post('/runner/claim',(_,res)=>{const job=[...jobs.values()].find(j=>j.status==='queued');if(!job)return res.json({job:null});job.status='running';job.lease=randomUUID();res.json({job:{id:job.id,kind:job.kind||'agent',lease:job.lease,input:job.input}});delete job.input;});
 app.get('/runner/control/:id',(req,res)=>{try{const j=get(req.params.id);res.json({cancelRequested:!!j.cancelRequested});}catch{res.status(404).json({error:'Unknown agent'});}});
 app.post('/runner/report/:id',(req,res)=>{try{const j=get(req.params.id),body=req.body;if(j.lease!==body.lease)return res.status(409).json({error:'Invalid job lease'});if(j.status!=='running')return res.json({ok:true});if(!['running','completed','failed','cancelled','timed-out','interrupted'].includes(body.status))return res.status(400).json({error:'Invalid status'});if(body.rpcResult!==undefined){if(!body.rpcResult||!Array.isArray(body.rpcResult.content)||JSON.stringify(body.rpcResult).length>8000000)return res.status(400).json({error:'Invalid forwarded result'});j.rpcResult=body.rpcResult;}j.status=body.status;for(const key of ['output','finalResult','sessionId','reason'])if(typeof body[key]==='string')j[key]=body[key].slice(0,key==='output'||key==='finalResult'?65536:1000);j.truncated=body.truncated===true;if(j.status!=='running'){j.finishedAt=new Date(clock()).toISOString();delete j.lease;}trim();res.json({ok:true});}catch{res.status(404).json({error:'Unknown agent'});}});
 app.post('/mcp',async(req,res)=>{
  const server=new Server({name:'bongee',version:'0.2.0'},{capabilities:{tools:{}}});server.setRequestHandler(ListToolsRequestSchema,async()=>({tools:[...runner.catalog,...tools.map(t=>({...t,name:'bongee_remote_'+t.name}))]}));server.setRequestHandler(CallToolRequestSchema,async({params})=>{try{const result=await call(params.name,params.arguments);return result.__rpcResult||{content:[{type:'text',text:JSON.stringify(result)}]};}catch(e){return {isError:true,content:[{type:'text',text:e.message}]};}});
  const transport=new StreamableHTTPServerTransport({sessionIdGenerator:undefined,enableJsonResponse:true});res.on('close',()=>{void transport.close();void server.close();});try{await server.connect(transport);await transport.handleRequest(req,res,req.body);}catch{if(!res.headersSent)res.status(500).json({error:'MCP request failed'});}
 });
 app.all('/mcp',(_,res)=>res.status(405).json({error:'Use POST for stateless MCP'}));
 app.use((error,req,res,next)=>res.status(400).json({error:'Invalid request'}));
 return {app,call,jobs};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){const {app}=createGateway();app.listen(Number(process.env.PORT||8080),'0.0.0.0',()=>process.stderr.write('Bongee gateway listening.\n'));}
