// Local OS-user writer exclusion, independent of OAuth/profile state roots.
// Contains only workspace/owner IDs, never tenant artifacts or prompts. Claims
// never expire automatically: a dead PID cannot prove its child writers stopped.
import { mkdir, lstat, chmod, open, readdir, unlink, rmdir, realpath } from 'node:fs/promises';
import { constants } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve, parse, sep } from 'node:path';
import { randomUUID } from 'node:crypto';
const UUID=/^[a-f0-9-]{36}$/i;
export const defaultWorkspaceClaimsRoot=join(homedir(),'.local','share','bongee','workspace-claims');
const beneath=(a,b)=>a.startsWith(b.endsWith(sep)?b:b+sep);
export const workspacesOverlap=(a,b)=>a===b||beneath(a,b)||beneath(b,a);
async function safeDirectory(root,create=false){
 let current=parse(root).root;
 for(const part of root.slice(current.length).split(sep).filter(Boolean)){
  current=join(current,part);
  if(create)try{await mkdir(current,{mode:0o700});}catch(e){if(e.code!=='EEXIST')throw e;}
  const s=await lstat(current);if(!s.isDirectory()||s.isSymbolicLink())throw Error('Unsafe workspace claim directory');
 }
 const s=await lstat(root);if(process.getuid&&s.uid!==process.getuid())throw Error('Workspace claim directory belongs to another OS user');
 if(create)await chmod(root,0o700);else if(s.mode&0o077)throw Error('Unsafe workspace claim directory permissions');
}
async function readPrivate(file){const handle=await open(file,constants.O_RDONLY|constants.O_NOFOLLOW);try{const s=await handle.stat();if(!s.isFile()||(s.mode&0o077)||(process.getuid&&s.uid!==process.getuid())||s.size>8192)throw Error('Unsafe workspace claim file');return JSON.parse(await handle.readFile('utf8'));}finally{await handle.close();}}
async function writeNew(file,value){const handle=await open(file,constants.O_WRONLY|constants.O_CREAT|constants.O_EXCL|constants.O_NOFOLLOW,0o600);try{await handle.writeFile(JSON.stringify(value));await handle.sync();}finally{await handle.close();}}
export class WorkspaceClaims{
 constructor({root=defaultWorkspaceClaimsRoot}={}){this.root=resolve(root);this.instance=randomUUID();this.ready=safeDirectory(this.root,true);}
 async lock(action){await this.ready;await safeDirectory(this.root);const lock=join(this.root,'.lock');
  for(let attempt=0;attempt<200;attempt++){
   try{await mkdir(lock,{mode:0o700});}
   catch(e){if(e.code!=='EEXIST')throw e;const s=await lstat(lock).catch(e=>{if(e.code==='ENOENT')return null;throw e;});if(s&&(!s.isDirectory()||s.isSymbolicLink()))throw Error('Unsafe workspace claim lock');if(attempt===199)throw Error('Workspace claim registry busy; verify owner/child processes before manual lock recovery');await new Promise(r=>setTimeout(r,10));continue;}
   try{await writeNew(join(lock,'owner.json'),{pid:process.pid,instance:this.instance});return await action();}
   finally{await unlink(join(lock,'owner.json')).catch(e=>{if(e.code!=='ENOENT')throw e;});await rmdir(lock);}
  }
 }
 async acquire(cwd,pipelineId){const canonical=await realpath(resolve(cwd));return this.lock(async()=>{
  for(const name of await readdir(this.root)){
   if(name==='.lock')continue;if(!/^[a-f0-9-]{36}\.json$/i.test(name))throw Error('Unknown workspace claim record; manual review required');
   const claim=await readPrivate(join(this.root,name));
   if(!claim||typeof claim.cwd!=='string'||!claim.cwd.startsWith(sep)||!UUID.test(claim.token)||!UUID.test(claim.instance)||!Number.isInteger(claim.ownerPid))throw Error('Invalid workspace claim; manual review required');
   if(workspacesOverlap(canonical,claim.cwd))throw Error('Workspace already has an active pipeline or unresolved workspace claim; verify prior writer cleanup before retrying');
  }
  const claim={token:randomUUID(),cwd:canonical,pipelineId,ownerPid:process.pid,instance:this.instance,acquiredAt:new Date().toISOString()};
  await writeNew(join(this.root,claim.token+'.json'),claim);return claim;
 });}
 async release(claim){if(!claim||!UUID.test(claim.token)||claim.instance!==this.instance||claim.ownerPid!==process.pid)throw Error('Workspace claim owner mismatch');return this.lock(async()=>{const file=join(this.root,claim.token+'.json'),stored=await readPrivate(file);if(stored.token!==claim.token||stored.instance!==this.instance||stored.ownerPid!==process.pid)throw Error('Workspace claim owner changed; refusing release');await unlink(file);});}
}
