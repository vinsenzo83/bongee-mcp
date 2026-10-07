import {readFile,readdir,stat,mkdir,writeFile,rename} from 'node:fs/promises';
import {homedir} from 'node:os';
import {join,resolve} from 'node:path';
import {randomUUID,createHash} from 'node:crypto';
function ownerIsAlive(pid){if(!Number.isInteger(pid)||pid<=0)return false;try{process.kill(pid,0);return true;}catch(e){return e.code==='EPERM';}}

export const PHASES=[['planning','기획'],['design','설계·디자인'],['development','개발'],['verification','검증']];
export const STATE_DIR=join(homedir(),'.session-agents-mcp');
export function clean(value,max=80){return String(value??'').replace(/[\x00-\x1f\x7f-\x9f]/g,' ').slice(0,max);}
export function phaseFor(role){const r=String(role||'').toLowerCase();if(/planner|researcher|기획|조사/.test(r))return 'planning';if(/architect|designer|설계|디자이너|디자인/.test(r))return 'design';if(/tester|reviewer|auditor|security|검증|테스터|리뷰|보안/.test(r))return 'verification';if(/coder|developer|engineer|implementer|개발/.test(r))return 'development';return 'unassigned';}
export function validateLabels({role,name,phase}={}){for(const [key,v]of Object.entries({role,name})){if(v!==undefined&&(typeof v!=='string'||!v.trim()||v.length>80||/[\x00-\x1f\x7f-\x9f]/.test(v)))throw Error('Invalid '+key+' label');}if(phase!==undefined&&!PHASES.some(([id])=>id===phase))throw Error('Invalid phase');return {...(role?{role}:{}),...(name?{name}:{}),...(phase?{phase}:{})};}
async function json(file){try{if((await stat(file)).size>2*1024*1024)return null;return JSON.parse(await readFile(file,'utf8'));}catch{return null;}}
function scoped(cwd,target){return !target||resolve(cwd||'')===resolve(target);}
export async function registryAgents(cwd){
 const base=join(resolve(cwd),'.claude-flow');const hive=await json(join(base,'agents.json')),canonical=await json(join(base,'agents/store.json'));
 return Object.values({...hive?.agents,...canonical?.agents}).filter(a=>a&&typeof a==='object'&&typeof a.agentId==='string');
}
function displayJob(j,now){let status=j.status;if(status==='running'&&!ownerIsAlive(j.ownerPid))status='interrupted';const start=Date.parse(j.startedAt),end=Date.parse(j.finishedAt);return {id:clean(j.id,100),source:j.source||'session',role:clean(j.role||'미지정'),name:clean(j.name||j.role||j.id,80),phase:j.phase||phaseFor(j.role),provider:clean(j.provider||'미확인'),status:clean(status),cwd:typeof j.cwd==='string'?resolve(j.cwd):'',elapsedSeconds:Number.isFinite(start)?Math.max(0,Math.floor(((Number.isFinite(end)?end:now)-start)/1000)):null,startedAt:j.startedAt,finishedAt:j.finishedAt,activity:clean(j.activity||'',100)};}
export async function readMonitor({stateDir=STATE_DIR,cwd,now=Date.now()}={}){
 const jobs=[],observations=[];const warnings=[];let names=[];
 try{names=await readdir(stateDir);}catch(e){if(e.code!=='ENOENT')warnings.push('실행 기록을 읽을 수 없음');}
 for(const n of names.filter(n=>/^[\w-]+\.json$/.test(n)).slice(-2000)){const j=await json(join(stateDir,n));if(j?.id&&j.status&&scoped(j.cwd,cwd))jobs.push(displayJob(j,now));}
 let files=[];try{files=await readdir(join(stateDir,'observations'));}catch{}
 for(const n of files.filter(n=>/^[\w-]+\.json$/.test(n)).slice(-2000)){const j=await json(join(stateDir,'observations',n));if(j?.id&&j.status&&scoped(j.cwd,cwd))observations.push(displayJob(j,now));}
 jobs.push(...observations);
 const observed=new Set(observations.map(j=>j.id));
 if(cwd)for(const a of await registryAgents(cwd)){if(observed.has(a.agentId))continue;const phase=phaseFor(a.agentType);jobs.push({id:clean(a.agentId,100),source:'ruflo-registry',role:clean(a.agentType||'미지정'),name:clean(a.agentType||a.agentId),phase,provider:'원본 설정',status:['busy','running'].includes(a.status)?'registered-busy':a.status==='terminated'?'terminated':'idle',cwd:resolve(cwd),elapsedSeconds:null,startedAt:a.createdAt,activity:'등록 상태; 실행 관찰 기록 없음'});}
 jobs.sort((a,b)=>(Date.parse(b.startedAt)||0)-(Date.parse(a.startedAt)||0));
 const counts={running:0,completed:0,failed:0,idle:0,other:0};for(const j of jobs){if(j.status==='running')counts.running++;else if(j.status==='completed')counts.completed++;else if(['failed','timed-out','interrupted'].includes(j.status))counts.failed++;else if(j.status==='idle')counts.idle++;else counts.other++;}
 const phases=PHASES.map(([id,label])=>{const all=jobs.filter(j=>j.phase===id),active=all.filter(j=>j.status==='running');return {id,label,status:active.length?'running':all[0]?.status||'not-started',running:active.length,latest:all[0]?.id||null};});
 return {capturedAt:new Date(now).toISOString(),scope:cwd?resolve(cwd):'all-local-session-jobs',counts,phases,agents:jobs,warnings,semantics:'Execution/registry state, not automatic four-stage orchestration or product acceptance. Unobserved registry busy is not counted as actual running.'};
}
export class ActivityTracker{
 constructor({stateDir=STATE_DIR,cwd=process.cwd(),provider='codex'}={}){this.dir=join(stateDir,'observations');this.cwd=resolve(cwd);this.provider=provider;this.jobs=new Map();}
 async save(j){await mkdir(this.dir,{recursive:true,mode:0o700});const file=join(this.dir,createHash('sha256').update(this.cwd+'\0'+j.id).digest('hex')+'.json'),tmp=file+'.'+randomUUID()+'.tmp';await writeFile(tmp,JSON.stringify(j),{mode:0o600});await rename(tmp,file);}
 async begin(id){if(this.jobs.has(id))return null;const a=(await registryAgents(this.cwd)).find(a=>a.agentId===id);const j={id,source:'ruflo-execution',role:a?.agentType||'미지정',cwd:this.cwd,provider:a?.provider&&a.provider!=='anthropic'?a.provider:this.provider,phase:phaseFor(a?.agentType),status:'running',ownerPid:process.pid,startedAt:new Date().toISOString(),activity:'agent_execute'};this.jobs.set(id,j);await this.save(j);return j;}
 async finish(j,result){if(!j)return;let success=!result?.isError;for(const block of result?.content||[])if(block.type==='text'){try{const data=JSON.parse(block.text);if(data.success===false||data.error)success=false;}catch{}}Object.assign(j,{status:success?'completed':'failed',finishedAt:new Date().toISOString()});await this.save(j);this.jobs.delete(j.id);}
}
