import {spawn} from 'node:child_process';
import {randomUUID} from 'node:crypto';
import {mkdir, chmod, readdir, readFile, writeFile, rename, stat} from 'node:fs/promises';
import {homedir} from 'node:os';
import {join, resolve} from 'node:path';
import {StringDecoder} from 'node:string_decoder';

export function safeEnv(source=process.env){
 const keys=['HOME','PATH','TMPDIR','USER','LANG','LC_ALL','SHELL','CODEX_HOME','XDG_CONFIG_HOME','XDG_DATA_HOME','XDG_CACHE_HOME'];
 return Object.fromEntries(keys.filter(k=>typeof source[k]==='string').map(k=>[k,source[k]]));
}
export function command(provider,{prompt,cwd,mode}){
 if(provider==='codex')return ['codex',['exec','--json','--skip-git-repo-check','--sandbox',mode,'--ignore-user-config','-C',cwd,'-']];
 const tools=mode==='read-only'?'Read,Glob,Grep':'Read,Glob,Grep,Edit,Write';
 return ['claude',['-p','--output-format','stream-json','--verbose','--safe-mode','--strict-mcp-config','--mcp-config','{"mcpServers":{}}','--permission-mode','default','--tools',tools,...(mode==='workspace-write'?['--allowedTools',tools]:[])]];
}
export function eventParser(provider,job,maxResult=65536){
 let pending='',discarding=false,completed=false,failed=false;
 const event=line=>{try{const e=JSON.parse(line);if(typeof e.thread_id==='string')job.sessionId=e.thread_id;if(typeof e.session_id==='string')job.sessionId=e.session_id;
  if(provider==='codex'){if(e.type==='error'||e.type==='turn.failed')failed=true;if(e.type==='item.completed'&&e.item?.type==='agent_message'&&typeof e.item.text==='string')job.finalResult=e.item.text.slice(0,maxResult);if(e.type==='turn.completed')completed=true;}
  else if(e.type==='result'){if(e.is_error===true||e.subtype!=='success')failed=true;else{completed=true;if(typeof e.result==='string')job.finalResult=e.result.slice(0,maxResult);}}
 }catch{}};
 return {push(chunk){for(const fragment of chunk.toString().split(/(?<=\n)/)){const newline=fragment.endsWith('\n');if(!discarding){pending+=fragment;if(pending.length>1024*1024){pending='';discarding=true;}}if(newline){if(!discarding)event(pending);pending='';discarding=false;}}},finish(){if(pending&&!discarding)event(pending);return completed&&!failed;}};
}
export class AgentManager {
 constructor({stateDir=join(homedir(),'.session-agents-mcp'),runner=spawn,authCheck,kill=(child)=>{try{process.kill(-child.pid,'SIGTERM');}catch{child.kill('SIGTERM');}const escalation=setTimeout(()=>{try{process.kill(-child.pid,'SIGKILL');}catch{}},1000);child.once('close',()=>clearTimeout(escalation));escalation.unref();},maxConcurrent=2,maxOutput=65536}={}){
  Object.assign(this,{stateDir,runner,kill,maxConcurrent,maxOutput});this.jobs=new Map();this.running=new Map();this.authCheck=authCheck||((p)=>this.checkAuth(p));
  this.ready=this.restore();this.startQueue=Promise.resolve();
 }
 async restore(){await mkdir(this.stateDir,{recursive:true,mode:0o700});await chmod(this.stateDir,0o700);for(const name of await readdir(this.stateDir)){if(!/^[\w-]+\.json$/.test(name))continue;try{const job=JSON.parse(await readFile(join(this.stateDir,name),'utf8'));if(!job.id||!job.status)continue;if(job.status==='running'){job.status='interrupted';job.reason='server restarted';job.finishedAt=new Date().toISOString();await this.persist(job);}this.jobs.set(job.id,job);}catch{}}}
 async persist(job){const file=join(this.stateDir,job.id+'.json');await writeFile(file+'.tmp',JSON.stringify(job),{mode:0o600});await rename(file+'.tmp',file);}
 async checkAuth(provider){return new Promise(resolveStatus=>{
  let text='',done=false;const child=this.runner(provider,provider==='codex'?['login','status']:['auth','status'],{env:safeEnv(),shell:false,stdio:['ignore','pipe','pipe']});
  const finish=(available,authenticated)=>{if(done)return;done=true;clearTimeout(timer);resolveStatus({provider,available,authenticated});};
  const timer=setTimeout(()=>{child.kill();finish(true,false);},10000);
  const append=d=>{text=(text+d.toString()).slice(0,8192);};child.stdout?.on('data',append);child.stderr?.on('data',append);
  child.on('error',()=>finish(false,false));child.on('close',code=>{let authenticated=false;if(code===0){if(provider==='claude'){try{const status=JSON.parse(text);authenticated=status.loggedIn===true&&!/api.?key/i.test(status.authMethod||'');}catch{authenticated=false;}}else authenticated=/logged in using ChatGPT/i.test(text)&&!/api.?key/i.test(text);}finish(true,authenticated);});
 });}
 async providerStatus(){return Promise.all(['codex','claude'].map(p=>this.authCheck(p)));}
 async start(input){const previous=this.startQueue;let release;this.startQueue=new Promise(r=>release=r);await previous;try{return await this.startLocked(input);}finally{release();}}
 async startLocked({provider,prompt,cwd,mode='read-only',timeoutSeconds=180}){
  await this.ready;if(!['codex','claude'].includes(provider)||!['read-only','workspace-write'].includes(mode))throw Error('Invalid provider or mode');
  if(typeof prompt!=='string'||!prompt.trim()||prompt.length>100000)throw Error('Prompt must contain 1 to 100000 characters');
  if(typeof cwd!=='string'||!cwd.trim())throw Error('Working directory is required');
  const directory=resolve(cwd);try{if(!(await stat(directory)).isDirectory())throw Error();}catch{throw Error('Working directory does not exist');}
  if(!Number.isInteger(timeoutSeconds)||timeoutSeconds<1||timeoutSeconds>600)throw Error('Timeout must be 1 to 600 seconds');
  if(this.running.size>=this.maxConcurrent)throw Error('Concurrent agent limit reached');
  const auth=await this.authCheck(provider);if(!auth.available||!auth.authenticated)throw Error('Provider CLI login is required');
  const job={id:randomUUID(),provider,cwd:directory,mode,status:'running',startedAt:new Date().toISOString(),output:'',truncated:false};
  this.jobs.set(job.id,job);try{await this.persist(job);}catch{Object.assign(job,{status:'failed',reason:'Unable to persist agent state',persistenceError:true,finishedAt:new Date().toISOString()});throw Error('Unable to persist agent state');}
  const [binary,args]=command(provider,{prompt,cwd:directory,mode});let child;
  try{child=this.runner(binary,args,{cwd:directory,env:safeEnv(),shell:false,detached:true,stdio:['pipe','pipe','pipe']});}catch{job.status='failed';job.reason='Unable to start provider';job.finishedAt=new Date().toISOString();try{await this.persist(job);}catch{job.persistenceError=true;}return this.status(job.id);}
  const parser=eventParser(provider,job,this.maxOutput),decoder=new StringDecoder('utf8');const handle={child,timer:null,settled:false};this.running.set(job.id,handle);
  const finish=async(status,reason,code)=>{if(handle.settled)return;handle.settled=true;clearTimeout(handle.timer);this.running.delete(job.id);Object.assign(job,{status,finishedAt:new Date().toISOString()});if(reason)job.reason=reason;if(Number.isInteger(code))job.exitCode=code;try{await this.persist(job);}catch{job.persistenceError=true;}};handle.finish=finish;
  const append=value=>{parser.push(value);const space=this.maxOutput-job.output.length;if(value.length>space)job.truncated=true;job.output+=value.slice(0,Math.max(0,space));};child.stdout?.on('data',data=>append(decoder.write(data)));
  // Provider diagnostics may echo prompts or credentials, so stderr is discarded.
  child.stderr?.on('data',()=>{});child.stdin?.on('error',()=>{});
  child.on('error',()=>{void finish('failed','Unable to start provider');});child.on('close',code=>{append(decoder.end());const success=parser.finish()&&code===0;void finish(success?'completed':'failed',success?undefined:'Provider did not report successful completion',code);});
  handle.timer=setTimeout(()=>{void finish('timed-out','Execution time limit reached').catch(()=>{});this.kill(child);},timeoutSeconds*1000);
  child.stdin?.end(prompt);return this.status(job.id);
 }
 status(id){const job=this.jobs.get(id);if(!job)throw Error('Unknown agent');const {output,...status}=job;return status;}
 result(id){const job=this.jobs.get(id);if(!job)throw Error('Unknown agent');return {...job};}
 async list(){await this.ready;return [...this.jobs.values()].map(j=>this.status(j.id));}
 async cancel(id){await this.ready;this.status(id);const handle=this.running.get(id);if(handle){const saved=handle.finish('cancelled','Cancelled by user');this.kill(handle.child);await saved;}return this.status(id);}
 async shutdown(){await this.ready;await Promise.all([...this.running.keys()].map(id=>this.cancel(id)));}
}
