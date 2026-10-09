import {createHash} from 'node:crypto';
import {homedir} from 'node:os';
import {join,isAbsolute} from 'node:path';
import {AgentManager,safeEnv} from './core.mjs';
import {pathToFileURL} from 'node:url';
import {fileURLToPath} from 'node:url';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';

export class GatewayRunner{
 constructor({url=process.env.BONGEE_GATEWAY_URL,token=process.env.BONGEE_GATEWAY_TOKEN,manager=new AgentManager(),toolClient=null,sessionLinkRoot=process.env.BONGEE_SESSION_LINK_ROOT}={}){if(!url||!token)throw Error('Gateway URL and connection token required');const parsed=new URL(url);if(parsed.protocol!=='https:'&&!['localhost','127.0.0.1','[::1]'].includes(parsed.hostname))throw Error('Gateway requires HTTPS');this.url=url.replace(/\/$/,'');this.token=token;if(sessionLinkRoot!==undefined&&!isAbsolute(sessionLinkRoot))throw Error('Session link root must be absolute');this.sessionLinkRoot=sessionLinkRoot||join(homedir(),'.local/share/bongee/remote-session-link',createHash('sha256').update(this.url+'\n'+token).digest('hex'));this.manager=manager;this.toolClient=toolClient;this.jobs=new Map();this.rpcJobs=new Map();this.failedJobs=new Map();this.catalogSentAt=0;this.stopped=false;}
 async connectTools(){if(this.toolClient)return;const client=new Client({name:'bongee-runner',version:'0.1.0'});const transport=new StdioClientTransport({command:process.execPath,args:[fileURLToPath(new URL('./proxy-server.mjs',import.meta.url))],env:{...safeEnv(),BONGEE_SESSION_LINK_ROOT:this.sessionLinkRoot},stderr:'ignore'});await client.connect(transport);this.toolClient=client;}
 async request(path,body){const response=await fetch(this.url+path,{method:body===undefined?'GET':'POST',headers:{Authorization:'Bearer '+this.token,'Content-Type':'application/json'},...(body!==undefined?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(10000)});if(!response.ok)throw Error('Gateway request failed');return response.json();}
 // Tick and completion callbacks share one control/report request per job.
 // Keep the result until acknowledged, so transient failures never rerun tools.
 async syncRpc(id,entry){
  if(entry.syncing)return entry.syncing;
  if(this.rpcJobs.get(id)!==entry)return;
  entry.syncing=(async()=>{
   const control=await this.request('/runner/control/'+id);
   if(control.cancelRequested){entry.controller.abort();entry.result={isError:true,content:[{type:'text',text:'Forwarded request cancellation requested; underlying tool side effects may already have occurred.'}]};entry.status='cancelled';}
   if(entry.result){await this.request('/runner/report/'+id,{lease:entry.lease,status:entry.status||'completed',rpcResult:entry.result});this.rpcJobs.delete(id);}
  })();
  try{await entry.syncing;}finally{entry.syncing=null;}
 }
 async syncFailure(id,entry){
  const control=await this.request('/runner/control/'+id);
  const cancelled=control.cancelRequested===true;
  const reason=cancelled?'Cancelled before local execution':entry.reason;
  await this.request('/runner/report/'+id,{lease:entry.lease,status:cancelled?'cancelled':'failed',reason,...(entry.kind==='rpc'?{rpcResult:{isError:true,content:[{type:'text',text:reason}]}}:{})});
  this.failedJobs.delete(id);
 }
 async failStart(job,reason){const entry={lease:job.lease,kind:job.kind,reason};this.failedJobs.set(job.id,entry);try{await this.syncFailure(job.id,entry);}catch{}}
 async tick(){await this.manager.ready;
  if(!this.cachedProviders){this.cachedProviders=await this.manager.providerStatus();this.providersFetchedAt=Date.now();}
  else if(Date.now()-this.providersFetchedAt>30000&&!this.providerRefresh){this.providerRefresh=this.manager.providerStatus().then(p=>{this.cachedProviders=p;this.providersFetchedAt=Date.now();}).catch(()=>{}).finally(()=>{this.providerRefresh=null;});}
  if(this.toolClient&&!this.cachedCatalog)this.cachedCatalog=(await this.toolClient.listTools()).tools;
  const providers=this.cachedProviders,catalog=this.cachedCatalog;const sendCatalog=!!catalog&&(!this.catalogSentAt||Date.now()-this.catalogSentAt>=30000);const heartbeat=await this.request('/runner/heartbeat',{providers,...(sendCatalog?{catalog}:{})});if(sendCatalog)this.catalogSentAt=Date.now();if(heartbeat.needsCatalog)this.catalogSentAt=0;
  for(const [id,entry] of this.failedJobs){try{await this.syncFailure(id,entry);}catch{}}
  for(const [id,entry] of this.rpcJobs){try{await this.syncRpc(id,entry);}catch{}}
  for(const [id,entry] of this.jobs){try{const control=await this.request('/runner/control/'+id);if(control.cancelRequested)await this.manager.cancel(entry.localId);const result=this.manager.result(entry.localId);await this.request('/runner/report/'+id,{...result,lease:entry.lease});if(result.status!=='running')this.jobs.delete(id);}catch{}}
  if(this.manager.running.size+this.rpcJobs.size+this.failedJobs.size>=2)return;const {job}=await this.request('/runner/claim',{});if(!job)return;
  if(job.kind==='rpc'){if(!this.toolClient){await this.failStart(job,'Local full-tool client unavailable');return;}const entry={lease:job.lease,controller:new AbortController()};this.rpcJobs.set(job.id,entry);void this.toolClient.callTool(job.input,undefined,{timeout:600000,signal:entry.controller.signal}).then(result=>{if(!entry.result){if(JSON.stringify(result).length>8000000){entry.status='failed';entry.result={isError:true,content:[{type:'text',text:'Forwarded tool result exceeded 8 MB limit; fetch pipeline history with historyLimit=1 and includeCurrent=false.'}]};}else entry.result=result;}}).catch(()=>{if(!entry.result){entry.status='failed';entry.result={isError:true,content:[{type:'text',text:'Forwarded tool execution failed.'}]};}}).then(()=>this.syncRpc(job.id,entry)).catch(()=>{});return;}
  try{const local=await this.manager.start(job.input);this.jobs.set(job.id,{localId:local.id,lease:job.lease});}catch{await this.failStart(job,'Local provider could not start; check login and working directory.');}
 }
 async run(){try{await this.connectTools();}catch{process.stderr.write('Full local tool catalog unavailable; session tools remain enabled.\n');}while(!this.stopped){try{await this.tick();}catch{process.stderr.write('Gateway connection unavailable; retrying.\n');}await new Promise(r=>setTimeout(r,2000));}}
 async stop(){this.stopped=true;for(const entry of this.rpcJobs.values())entry.controller.abort();await this.manager.shutdown();await this.toolClient?.close();}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){const runner=new GatewayRunner();const stop=async()=>{await runner.stop();process.exit(0);};process.on('SIGINT',stop);process.on('SIGTERM',stop);await runner.run();}
