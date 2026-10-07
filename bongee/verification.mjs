import {spawn} from 'node:child_process';
import {realpath,readdir,readFile,lstat,open,readlink} from 'node:fs/promises';
import {constants} from 'node:fs';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {StringDecoder} from 'node:string_decoder';
import {safeEnv} from './core.mjs';
import {fileURLToPath} from 'node:url';
import {processIdentity} from './session-supervisor.mjs';

const controls=/[\x00-\x1f\x7f]/;
export function validateChecks(checks){
 if(!Array.isArray(checks)||checks.length>32)throw new Error('Checks must be an array of at most 32 entries');
 const seen=new Set();return checks.map((c,i)=>{if(!c||typeof c.command!=='string'||!c.command||c.command.length>1024||controls.test(c.command)||!Array.isArray(c.args)||c.args.length>128||c.args.some(a=>typeof a!=='string'||a.length>8192||controls.test(a))||c.args.reduce((n,a)=>n+a.length,0)>32768)throw new Error('Invalid verification command');
 const id=c.id??`check-${i+1}`;if(typeof id!=='string'||!id||id.length>128||controls.test(id)||seen.has(id))throw new Error('Invalid or duplicate check id');seen.add(id);if(c.label!==undefined&&(typeof c.label!=='string'||c.label.length>512||controls.test(c.label)))throw new Error('Invalid check label');return {id,command:c.command,args:[...c.args],...(c.label?{label:c.label}:{})};});
}
export async function discoverChecks(cwd){
 const root=await realpath(cwd),names=await readdir(root),out=[];const add=(id,command,args)=>out.push({id,command,args});
 if(names.includes('package.json')){const pkg=JSON.parse(await readFile(join(root,'package.json'),'utf8'));const scripts=pkg.scripts||{},seen=new Set();const canonicalScript=(key,visited=new Set())=>{if(visited.has(key))return null;visited.add(key);const value=scripts[key];if(typeof value!=='string')return null;const alias=value.trim().match(/^(?:npm run|npm run-script|pnpm run|yarn) ([\w:-]+)$/);return alias?canonicalScript(alias[1],visited):value.trim();};for(const key of ['build','typecheck','check','lint','test']){const s=scripts[key];if(typeof s!=='string'||!s.trim()||/\b(?:--watch|watch|--watchAll)\b/.test(s)||/no test specified|\becho\b.*\b(?:test|placeholder)|^exit\s+0$/.test(s))continue;const canonical=canonicalScript(key);if(!canonical||/no test specified|\becho\b.*\b(?:test|placeholder)|^exit\s+0$|\b(?:--watch|watch|--watchAll)\b/.test(canonical))continue;if(seen.has(canonical))continue;seen.add(canonical);add(`node-${key}`,'npm',['run',key]);}}
 if(names.some(n=>['pytest.ini','pyproject.toml','requirements.txt','setup.cfg','tox.ini'].includes(n)))add('python-test','python3',['-m','pytest']);
 if(names.includes('Cargo.toml'))add('rust-test','cargo',['test']);
 if(names.includes('go.mod'))add('go-test','go',['test','./...']);
 if(names.some(n=>/\.(?:csproj|sln|slnx)$/.test(n)))add('dotnet-test','dotnet',['test']);
 if(names.includes('pom.xml'))add('maven-test',names.includes('mvnw')?'./mvnw':'mvn',['test']);
 if(names.some(n=>['build.gradle','build.gradle.kts'].includes(n)))add('gradle-test',names.includes('gradlew')?'./gradlew':'gradle',['test']);
 return validateChecks(out);
}
const ignored=new Set(['.git','node_modules','.next','venv','.venv','__pycache__','.cache','target','coverage','.pytest_cache','.mypy_cache','.gradle','.bongee']);
export async function workspaceFingerprint(cwd){
 const root=await realpath(cwd),hash=createHash('sha256');let files=0,bytes=0,entries=0;
 async function walk(dir,relative=''){for(const name of (await readdir(dir)).sort()){if(++entries>50000)throw new Error('Workspace fingerprint exceeds entry limit');if(ignored.has(name))continue;const path=join(dir,name),rel=relative?`${relative}/${name}`:name,s=await lstat(path);if(s.isSymbolicLink()){const target=await readlink(path);hash.update('symlink\0'+rel+'\0'+target+'\0');continue;}if(s.isDirectory()){await walk(path,rel);continue;}if(!s.isFile())continue;if(++files>20000||s.size>32*1024*1024||(bytes+=s.size)>256*1024*1024)throw new Error('Workspace fingerprint exceeds source limits');const handle=await open(path,constants.O_RDONLY|constants.O_NOFOLLOW);let data;try{const actual=await handle.stat();if(!actual.isFile()||actual.size!==s.size)throw new Error('Source changed during fingerprint');data=await handle.readFile();if(data.length!==s.size)throw new Error('Source changed during fingerprint');}finally{await handle.close();}hash.update(rel+'\0'+data.length+'\0');hash.update(data);}}
 await walk(root);return hash.digest('hex');
}
function redact(s){return s.replace(/\bBearer\s+[^\s"']+/gi,'Bearer [REDACTED]').replace(/\b(?:sk-[\w-]{8,}|gh[pousr]_[\w]{8,})\b/g,'[REDACTED]').replace(/((?:api[_-]?key|access[_-]?token|secret)\s*[=:]\s*)[^\s,;"']+/gi,'$1[REDACTED]');}
export class VerificationRunner{
 constructor({timeoutSeconds=300,maxOutput=65536,runner=spawn}={}){if(!Number.isFinite(timeoutSeconds)||timeoutSeconds<=0||timeoutSeconds>3600||!Number.isInteger(maxOutput)||maxOutput<1||maxOutput>1048576)throw new Error('Invalid verification limits');Object.assign(this,{timeoutSeconds,maxOutput,runner});}
 async run({cwd,checks,signal}={}){const root=await realpath(cwd),selected=checks===undefined?await discoverChecks(root):validateChecks(checks);let before;try{before=await workspaceFingerprint(root);}catch(e){return {passed:false,checks:[],fingerprintBefore:null,fingerprintAfter:null,workspaceChanged:false,reason:e.message};}const results=[];for(const c of selected){if(signal?.aborted)break;results.push(await this.runOne(root,c,signal));if(signal?.aborted)break;}let after=null,reason;try{after=await workspaceFingerprint(root);}catch(e){reason=e.message;}const changed=after!==null&&before!==after;return {passed:selected.length>0&&results.length===selected.length&&results.every(r=>r.status==='passed')&&!changed&&!reason&&!signal?.aborted,checks:results,fingerprintBefore:before,fingerprintAfter:after,workspaceChanged:changed,...(reason?{reason}:!selected.length?{reason:'No verification checks available'}:signal?.aborted?{reason:'Verification cancelled'}:changed?{reason:'Source changed during verification'}:{})};}
 runOne(cwd,c,signal){return new Promise(resolve=>{const start=Date.now(),decoder={stdout:new StringDecoder('utf8'),stderr:new StringDecoder('utf8')},output={stdout:'',stderr:''};let count=0,truncated=false,child,status,timer,killTimer,finished=false;
 const append=(key,chunk)=>{const s=decoder[key].write(chunk);const room=this.maxOutput-count;if(Buffer.byteLength(s)>room)truncated=true;if(room>0){const clipped=Buffer.from(s).subarray(0,room).toString('utf8').replace(/\uFFFD$/,'');output[key]+=clipped;count+=Buffer.byteLength(clipped);}};
 const kill=()=>{if(!child?.pid)return;try{process.kill(-child.pid,'SIGTERM');}catch{child.kill('SIGTERM');}killTimer=setTimeout(()=>{try{process.kill(-child.pid,'SIGKILL');}catch{child.kill('SIGKILL');}},250);};
 const abort=()=>{status='cancelled';kill();};
 const done=(code,error)=>{if(finished)return;finished=true;clearTimeout(timer);if(status&&child?.pid){try{process.kill(-child.pid,'SIGKILL');}catch{}}clearTimeout(killTimer);signal?.removeEventListener('abort',abort);for(const key of ['stdout','stderr']){const tail=decoder[key].end();if(tail&&count+Buffer.byteLength(tail)<=this.maxOutput){output[key]+=tail;count+=Buffer.byteLength(tail);}}if(error&&count<this.maxOutput)output.stderr+=(error.message||String(error)).slice(0,this.maxOutput-count);resolve({...c,status:status||(code===0&&!error?'passed':'failed'),exitCode:Number.isInteger(code)?code:null,durationMs:Date.now()-start,stdout:redact(output.stdout),stderr:redact(output.stderr),truncated});};
 if(signal?.aborted){status='cancelled';done(null);return;}try{const identity=this.runner===spawn?processIdentity(process.pid):null;if(this.runner===spawn&&!identity)throw new Error('Cannot verify owner process identity');const binary=this.runner===spawn?process.execPath:c.command,args=this.runner===spawn?[fileURLToPath(new URL('./session-supervisor.mjs',import.meta.url)),'--owner',String(process.pid),'--owner-identity',identity,'--job',c.id,'--',c.command,...c.args]:c.args;child=this.runner(binary,args,{cwd,env:safeEnv(),shell:false,detached:true,stdio:['ignore','pipe','pipe']});child.stdout?.on('data',d=>append('stdout',d));child.stderr?.on('data',d=>append('stderr',d));child.once('error',e=>done(null,e));child.once('close',code=>done(code));signal?.addEventListener('abort',abort,{once:true});timer=setTimeout(()=>{status='timed-out';kill();},this.timeoutSeconds*1000);if(signal?.aborted)abort();}catch(e){done(null,e);}
 });}
}
