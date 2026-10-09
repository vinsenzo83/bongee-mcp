import {mkdir,writeFile,rename,readdir,readFile,lstat} from 'node:fs/promises';
import {join} from 'node:path';
import {homedir} from 'node:os';
import {randomUUID} from 'node:crypto';
import {readMonitor,PHASES} from './monitor-state.mjs';

export async function recordConnection(stateDir,{connected,now=Date.now(),pid=process.pid}={}){
 const dir=join(stateDir,'connections');await mkdir(dir,{recursive:true,mode:0o700});
 const file=join(dir,pid+'.json'),temp=file+'.'+randomUUID()+'.tmp';
 await writeFile(temp,JSON.stringify({connected:connected===true,checkedAt:now,pid}),{mode:0o600,flag:'wx'});await rename(temp,file);
}
async function entries(dir){try{return await readdir(dir,{withFileTypes:true});}catch{return [];}}
export async function readConnection(stateDir,{now=Date.now(),alive=pid=>{try{process.kill(pid,0);return true;}catch(e){return e.code==='EPERM';}}}={}){
 let known=false,connected=0;
 for(const entry of (await entries(join(stateDir,'connections'))).filter(e=>e.isFile()&&/^\d+\.json$/.test(e.name))){
  try{const file=join(stateDir,'connections',entry.name),s=await lstat(file);if(!s.isFile()||s.size>1024)continue;const r=JSON.parse(await readFile(file,'utf8'));if(!Number.isInteger(r.pid)||r.pid<=0||!Number.isFinite(r.checkedAt))continue;known=true;
   if(r.connected===true&&now-r.checkedAt>=0&&now-r.checkedAt<15000&&alive(r.pid))connected++;
  }catch{}
 }
 return {known,connected};
}
// A desktop footer is local to this OS user, not to one remote principal.
// Keep project filtering, while including principal-specific runner records.
export async function readDesktopMonitor({cwd,home=homedir(),stateDir=process.env.BONGEE_SESSION_STATE_DIR,now=Date.now()}={}){
 const base=join(home,'.local/share/bongee/state');
 const dirs=stateDir?[stateDir]:[join(home,'.session-agents-mcp'),...(await entries(base)).filter(e=>e.isDirectory()&&/^[0-9a-f-]{36}$/i.test(e.name)).map(e=>join(base,e.name))];
 const states=await Promise.all(dirs.map(dir=>readMonitor({stateDir:dir,cwd,now}))),links=await Promise.all(dirs.map(dir=>readConnection(dir,{now})));
 const result=states[0],agents=[...new Map(states.flatMap(s=>s.agents).map(a=>[a.source+':'+a.id,a])).values()].sort((a,b)=>(Date.parse(b.startedAt)||0)-(Date.parse(a.startedAt)||0));
 const pipelines=states.flatMap(s=>s.pipelines).sort((a,b)=>(Date.parse(b.startedAt)||0)-(Date.parse(a.startedAt)||0)),pipeline=pipelines.find(p=>p.status==='running')||pipelines[0];
 const counts={running:0,completed:0,failed:0,idle:0,other:0};for(const a of agents){const k=['running','completed','idle'].includes(a.status)?a.status:['failed','timed-out','interrupted'].includes(a.status)?'failed':'other';counts[k]++;}
 const phases=pipeline?pipeline.phases.map(p=>({...p,running:agents.filter(a=>a.pipelineId===pipeline.id&&a.phase===p.id&&a.status==='running').length})):PHASES.map(([id,label])=>{const all=agents.filter(a=>a.phase===id),running=all.filter(a=>a.status==='running').length;return {id,label,running,status:running?'running':all[0]?.status||'not-started'};});
 return {...result,agents,pipeline,pipelines,counts,phases,connection:{known:links.some(l=>l.known),connected:links.reduce((n,l)=>n+l.connected,0)}};
}
