import {AgentManager,safeEnv} from './core.mjs';
import {pathToFileURL} from 'node:url';
import {fileURLToPath} from 'node:url';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';

export class GatewayRunner{
 constructor({url=process.env.BONGEE_GATEWAY_URL,token=process.env.BONGEE_GATEWAY_TOKEN,manager=new AgentManager(),toolClient=null}={}){if(!url||!token)throw Error('Gateway URL and connection token required');const parsed=new URL(url);if(parsed.protocol!=='https:'&&!['localhost','127.0.0.1','[::1]'].includes(parsed.hostname))throw Error('Gateway requires HTTPS');this.url=url.replace(/\/$/,'');this.token=token;this.manager=manager;this.toolClient=toolClient;this.jobs=new Map();this.rpcJobs=new Map();this.stopped=false;}
 async connectTools(){if(this.toolClient)return;const client=new Client({name:'bongee-runner',version:'0.1.0'});const transport=new StdioClientTransport({command:process.execPath,args:[fileURLToPath(new URL('./proxy-server.mjs',import.meta.url))],env:safeEnv(),stderr:'ignore'});await client.connect(transport);this.toolClient=client;}
 async request(path,body){const response=await fetch(this.url+path,{method:body===undefined?'GET':'POST',headers:{Authorization:'Bearer '+this.token,'Content-Type':'application/json'},...(body!==undefined?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(10000)});if(!response.ok)throw Error('Gateway request failed');return response.json();}
 async tick(){await this.manager.ready;
  if(!this.cachedProviders){this.cachedProviders=await this.manager.providerStatus();this.providersFetchedAt=Date.now();}
  else if(Date.now()-this.providersFetchedAt>30000&&!this.providerRefresh){this.providerRefresh=this.manager.providerStatus().then(p=>{this.cachedProviders=p;this.providersFetchedAt=Date.now();}).catch(()=>{}).finally(()=>{this.providerRefresh=null;});}
  if(this.toolClient&&!this.cachedCatalog)this.cachedCatalog=(await this.toolClient.listTools()).tools;
  const providers=this.cachedProviders,catalog=this.cachedCatalog;await this.request('/runner/heartbeat',{providers,...(catalog?{catalog}:{})});
  for(const [id,entry] of this.rpcJobs){try{const control=await this.request('/runner/control/'+id);if(control.cancelRequested){entry.controller.abort();entry.result={isError:true,content:[{type:'text',text:'Forwarded request cancellation requested; underlying tool side effects may already have occurred.'}]};entry.status='cancelled';}if(entry.result){await this.request('/runner/report/'+id,{lease:entry.lease,status:entry.status||'completed',rpcResult:entry.result});this.rpcJobs.delete(id);}}catch{}}
  for(const [id,entry] of this.jobs){try{const control=await this.request('/runner/control/'+id);if(control.cancelRequested)await this.manager.cancel(entry.localId);const result=this.manager.result(entry.localId);await this.request('/runner/report/'+id,{...result,lease:entry.lease});if(result.status!=='running')this.jobs.delete(id);}catch{}}
  if(this.manager.running.size+this.rpcJobs.size>=2)return;const {job}=await this.request('/runner/claim',{});if(!job)return;
  if(job.kind==='rpc'){if(!this.toolClient){await this.request('/runner/report/'+job.id,{lease:job.lease,status:'failed',reason:'Local full-tool client unavailable'});return;}const entry={lease:job.lease,controller:new AbortController()};this.rpcJobs.set(job.id,entry);void this.toolClient.callTool(job.input,undefined,{timeout:600000,signal:entry.controller.signal}).then(result=>{if(!entry.result){if(JSON.stringify(result).length>1000000){entry.status='failed';entry.result={isError:true,content:[{type:'text',text:'Forwarded tool result exceeded 1 MB limit.'}]};}else entry.result=result;}}).catch(()=>{if(!entry.result){entry.status='failed';entry.result={isError:true,content:[{type:'text',text:'Forwarded tool execution failed.'}]};}});return;}
  try{const local=await this.manager.start(job.input);this.jobs.set(job.id,{localId:local.id,lease:job.lease});}catch{await this.request('/runner/report/'+job.id,{lease:job.lease,status:'failed',reason:'Local provider could not start; check login and working directory.'});}
 }
 async run(){try{await this.connectTools();}catch{process.stderr.write('Full local tool catalog unavailable; session tools remain enabled.\n');}while(!this.stopped){try{await this.tick();}catch{process.stderr.write('Gateway connection unavailable; retrying.\n');}await new Promise(r=>setTimeout(r,2000));}}
 async stop(){this.stopped=true;for(const entry of this.rpcJobs.values())entry.controller.abort();await this.manager.shutdown();await this.toolClient?.close();}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){const runner=new GatewayRunner();const stop=async()=>{await runner.stop();process.exit(0);};process.on('SIGINT',stop);process.on('SIGTERM',stop);await runner.run();}
