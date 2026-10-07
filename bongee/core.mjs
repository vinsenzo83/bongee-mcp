import {spawn} from 'node:child_process';
import {randomUUID} from 'node:crypto';
import {mkdir, chmod, readdir, readFile, writeFile, rename, stat} from 'node:fs/promises';
import {homedir} from 'node:os';
import {join, resolve} from 'node:path';
import {StringDecoder} from 'node:string_decoder';
import {fileURLToPath} from 'node:url';
import {processIdentity,waitForSupervisor} from './session-supervisor.mjs';
import {validateLabels,phaseFor} from './monitor-state.mjs';

export function safeEnv(source=process.env){
 const keys=['HOME','PATH','TMPDIR','USER','LANG','LC_ALL','SHELL','CODEX_HOME','XDG_CONFIG_HOME','XDG_DATA_HOME','XDG_CACHE_HOME'];
 return Object.fromEntries(keys.filter(k=>typeof source[k]==='string').map(k=>[k,source[k]]));
}
export function ownerIsAlive(pid){if(!Number.isInteger(pid)||pid<=0)return false;try{process.kill(pid,0);return true;}catch(error){return error.code==='EPERM';}}
export function command(provider,{prompt,cwd,mode,schemaPath,resultSchema}){
 if(provider==='codex')return ['codex',['exec','--json','--skip-git-repo-check','--sandbox',mode,'--ignore-user-config',...(schemaPath?['--output-schema',schemaPath]:[]),'-C',cwd,'-']];
 const tools=mode==='read-only'?'Read,Glob,Grep':'Read,Glob,Grep,Edit,Write';
 return ['claude',['-p','--output-format','stream-json','--verbose','--safe-mode','--strict-mcp-config','--mcp-config','{"mcpServers":{}}','--permission-mode','default','--tools',tools,...(mode==='workspace-write'?['--allowedTools',tools]:[]),...(resultSchema?['--json-schema',JSON.stringify(resultSchema)]:[])]];
}
export function eventParser(provider,job,maxResult=65536){
 let pending='',discarding=false,completed=false,failed=false;
 const event=line=>{try{const e=JSON.parse(line);job.lastEventAt=new Date().toISOString();if(typeof e.thread_id==='string')job.sessionId=e.thread_id;if(typeof e.session_id==='string')job.sessionId=e.session_id;
  if(provider==='codex'){const activities={command_execution:'명령 실행',file_change:'파일 변경',agent_message:'응답 작성',reasoning:'분석 중',mcp_tool_call:'MCP 호출',web_search:'검색 중'};if(activities[e.item?.type])job.activity=activities[e.item.type];else if(e.type==='turn.started')job.activity='분석 중';}
  else if(e.type==='assistant')job.activity=e.message?.content?.some(c=>c.type==='tool_use')?'도구 호출':'응답 작성';
  if(provider==='codex'){if(e.type==='error'||e.type==='turn.failed')failed=true;if(e.type==='item.completed'&&e.item?.type==='agent_message'&&typeof e.item.text==='string'){job.finalResult=e.item.text.slice(0,maxResult);if(e.item.text.length>maxResult)job.resultTruncated=true;}if(e.type==='turn.completed')completed=true;}
  else if(e.type==='result'){if(e.is_error===true||e.subtype!=='success')failed=true;else{completed=true;const final=e.structured_output!==undefined?JSON.stringify(e.structured_output):e.result;if(typeof final==='string'){job.finalResult=final.slice(0,maxResult);if(final.length>maxResult)job.resultTruncated=true;}}}
 }catch{}};
 return {push(chunk){for(const fragment of chunk.toString().split(/(?<=\n)/)){const newline=fragment.endsWith('\n');if(!discarding){pending+=fragment;if(pending.length>1024*1024){pending='';discarding=true;}}if(newline){if(!discarding)event(pending);pending='';discarding=false;}}},finish(){if(pending&&!discarding)event(pending);return completed&&!failed;}};
}
export class AgentManager {
 constructor({stateDir=join(homedir(),'.session-agents-mcp'),runner=spawn,authCheck,kill=(child)=>{const signal=value=>{try{process.kill(-child.pid,value);}catch{try{child.kill(value);}catch{}}};signal('SIGTERM');const escalation=setTimeout(()=>signal('SIGKILL'),1000);child.once('close',()=>{clearTimeout(escalation);signal('SIGKILL');});escalation.unref();},maxConcurrent=2,maxOutput=65536}={}){
  Object.assign(this,{stateDir,runner,kill,maxConcurrent,maxOutput});this.jobs=new Map();this.running=new Map();this.owned=new Set();this.authCheck=authCheck||((p)=>this.checkAuth(p));
  this.persistQueues=new Map();this.ready=this.restore();this.startQueue=Promise.resolve();
 }
 async restore(){await mkdir(this.stateDir,{recursive:true,mode:0o700});await chmod(this.stateDir,0o700);await this.refresh();}
 async refresh(id){const names=id?[id+'.json']:await readdir(this.stateDir);for(const name of names){if(!/^[\w-]+\.json$/.test(name))continue;const jobId=name.slice(0,-5);if(this.owned.has(jobId))continue;try{const job=JSON.parse(await readFile(join(this.stateDir,name),'utf8'));if(job.id!==jobId||!job.status)continue;if(job.status==='running'&&(!ownerIsAlive(job.ownerPid)||(job.ownerIdentity&&processIdentity(job.ownerPid)!==job.ownerIdentity))){if(!(await waitForSupervisor(job))){this.jobs.set(job.id,job);continue;}job.status='interrupted';job.reason='Owner process is no longer running';job.finishedAt=new Date().toISOString();await this.persist(job);}this.jobs.set(job.id,job);}catch{}}}
 async persist(job){const previous=this.persistQueues.get(job.id)||Promise.resolve();const serialized=JSON.stringify(job);const op=previous.catch(()=>{}).then(async()=>{const file=join(this.stateDir,job.id+'.json'),temp=file+'.'+randomUUID()+'.tmp';await writeFile(temp,serialized,{mode:0o600});await rename(temp,file);});this.persistQueues.set(job.id,op);try{await op;}finally{if(this.persistQueues.get(job.id)===op)this.persistQueues.delete(job.id);}}
 async readStatus(id){await this.ready;await this.refresh(id);return this.status(id);}
 async readResult(id){await this.ready;await this.refresh(id);return this.result(id);}
 async checkAuth(provider){return new Promise(resolveStatus=>{
  let text='',done=false;const child=this.runner(provider,provider==='codex'?['login','status']:['auth','status'],{env:safeEnv(),shell:false,stdio:['ignore','pipe','pipe']});
  const finish=(available,authenticated)=>{if(done)return;done=true;clearTimeout(timer);resolveStatus({provider,available,authenticated});};
  const timer=setTimeout(()=>{child.kill();finish(true,false);},10000);
  const append=d=>{text=(text+d.toString()).slice(0,8192);};child.stdout?.on('data',append);child.stderr?.on('data',append);
  child.on('error',()=>finish(false,false));child.on('close',code=>{let authenticated=false;if(code===0){if(provider==='claude'){try{const status=JSON.parse(text);authenticated=status.loggedIn===true&&!/api.?key/i.test(status.authMethod||'');}catch{authenticated=false;}}else authenticated=/logged in using ChatGPT/i.test(text)&&!/api.?key/i.test(text);}finish(true,authenticated);});
 });}
 async providerStatus(){return Promise.all(['codex','claude'].map(p=>this.authCheck(p)));}
 async start(input){const previous=this.startQueue;let release;this.startQueue=new Promise(r=>release=r);await previous;try{return await this.startLocked(input);}finally{release();}}
 async startLocked({provider,prompt,cwd,mode='read-only',timeoutSeconds=180,role,name,phase,pipelineId,resultSchema}){
  await this.ready;if(!['codex','claude'].includes(provider)||!['read-only','workspace-write'].includes(mode))throw Error('Invalid provider or mode');
  if(typeof prompt!=='string'||!prompt.trim()||prompt.length>100000)throw Error('Prompt must contain 1 to 100000 characters');
  if(typeof cwd!=='string'||!cwd.trim())throw Error('Working directory is required');
  const directory=resolve(cwd);try{if(!(await stat(directory)).isDirectory())throw Error();}catch{throw Error('Working directory does not exist');}
  if(!Number.isInteger(timeoutSeconds)||timeoutSeconds<1||timeoutSeconds>600)throw Error('Timeout must be 1 to 600 seconds');
  const labels=validateLabels({role,name,phase});
  if(pipelineId!==undefined&&(typeof pipelineId!=='string'||!/^[\w-]{1,100}$/.test(pipelineId)))throw Error('Invalid pipeline ID');
  if(resultSchema!==undefined&&(!resultSchema||typeof resultSchema!=='object'||resultSchema.type!=='object'||JSON.stringify(resultSchema).length>32768))throw Error('Invalid result schema');
  if(this.running.size>=this.maxConcurrent)throw Error('Concurrent agent limit reached');
  const auth=await this.authCheck(provider);if(!auth.available||!auth.authenticated)throw Error('Provider CLI login is required');
  const job={id:randomUUID(),provider,cwd:directory,mode,...labels,...(pipelineId?{pipelineId}:{}),phase:phase||phaseFor(role),status:'running',activity:'시작 중',ownerPid:process.pid,startedAt:new Date().toISOString(),output:'',truncated:false};
  let schemaPath;if(resultSchema){const directory=join(this.stateDir,'schemas');await mkdir(directory,{recursive:true,mode:0o700});schemaPath=join(directory,job.id+'.json');await writeFile(schemaPath,JSON.stringify(resultSchema),{mode:0o600});}
  this.jobs.set(job.id,job);this.owned.add(job.id);try{await this.persist(job);}catch{Object.assign(job,{status:'failed',reason:'Unable to persist agent state',persistenceError:true,finishedAt:new Date().toISOString()});throw Error('Unable to persist agent state');}
  const [binary,args]=command(provider,{prompt,cwd:directory,mode,schemaPath,resultSchema});let child;
  try{const supervised=this.runner===spawn;const ownerIdentity=supervised?processIdentity(process.pid):null;if(supervised&&!ownerIdentity)throw Error('Unable to identify owner process');const launchBinary=supervised?process.execPath:binary;const launchArgs=supervised?[fileURLToPath(new URL('./session-supervisor.mjs',import.meta.url)),'--owner',String(process.pid),'--owner-identity',ownerIdentity,'--job',job.id,'--',binary,...args]:args;child=this.runner(launchBinary,launchArgs,{cwd:directory,env:safeEnv(),shell:false,detached:true,stdio:['pipe','pipe','pipe']});if(supervised){job.ownerIdentity=ownerIdentity;job.supervisorPid=child.pid;job.supervisorIdentity=processIdentity(child.pid);job.supervisorJobId=job.id;}}catch{job.status='failed';job.reason='Unable to start provider';job.finishedAt=new Date().toISOString();try{await this.persist(job);}catch{job.persistenceError=true;}return this.status(job.id);}
  const parser=eventParser(provider,job,this.maxOutput),decoder=new StringDecoder('utf8');let resolveStopped;const stopped=new Promise(resolve=>{resolveStopped=resolve;});const handle={child,timer:null,settled:false,stopped,requested:null};this.running.set(job.id,handle);
  let persisting=false;handle.progressTimer=setInterval(async()=>{if(persisting||handle.settled)return;persisting=true;try{await this.persist(job);}catch{job.persistenceError=true;}finally{persisting=false;}},1000);handle.progressTimer.unref();
  const finish=async(status,reason,code)=>{if(handle.settled)return;handle.settled=true;clearTimeout(handle.timer);clearInterval(handle.progressTimer);this.running.delete(job.id);Object.assign(job,{status,finishedAt:new Date().toISOString()});if(reason)job.reason=reason;if(Number.isInteger(code))job.exitCode=code;try{await this.persist(job);}catch{job.persistenceError=true;}finally{resolveStopped();}};handle.finish=finish;
  handle.stop=(status,reason)=>{if(!handle.requested&&!handle.settled){handle.requested={status,reason};job.stopRequested=status;job.activity='종료 대기 중';clearTimeout(handle.timer);try{this.kill(child);}catch{try{child.kill('SIGKILL');}catch{}}}return stopped;};
  const append=value=>{parser.push(value);const space=this.maxOutput-job.output.length;if(value.length>space)job.truncated=true;job.output+=value.slice(0,Math.max(0,space));};child.stdout?.on('data',data=>append(decoder.write(data)));
  // Provider diagnostics may echo prompts or credentials, so stderr is discarded.
  child.stderr?.on('data',()=>{});child.stdin?.on('error',()=>{});
  child.on('error',()=>{if(!handle.requested)handle.requested={status:'failed',reason:'Unable to start provider'};});child.on('close',code=>{if(this.runner===spawn&&Number.isInteger(child.pid)){try{process.kill(-child.pid,'SIGKILL');}catch{}}append(decoder.end());const success=parser.finish()&&code===0;const requested=handle.requested;void finish(requested?.status||(success?'completed':'failed'),requested?.reason||(success?undefined:'Provider did not report successful completion'),code);});
  handle.timer=setTimeout(()=>{void handle.stop('timed-out','Execution time limit reached');},timeoutSeconds*1000);
  child.stdin?.end(role?'작업 역할: '+role+'\n\n'+prompt:prompt);if(job.supervisorPid){try{await this.persist(job);}catch{job.persistenceError=true;await handle.stop('failed','Unable to persist supervisor state');}}return this.status(job.id);
 }
 status(id){const job=this.jobs.get(id);if(!job)throw Error('Unknown agent');const {output,...status}=job;return status;}
 result(id){const job=this.jobs.get(id);if(!job)throw Error('Unknown agent');return {...job};}
 async list(){await this.ready;await this.refresh();return [...this.jobs.values()].map(j=>this.status(j.id));}
 async cancel(id){await this.ready;this.status(id);const handle=this.running.get(id);if(handle){await handle.stop('cancelled','Cancelled by user');}return this.status(id);}
 async shutdown(){await this.ready;await Promise.all([...this.running.keys()].map(id=>this.cancel(id)));}
}
