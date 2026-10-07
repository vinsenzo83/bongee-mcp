import {spawn,spawnSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
export function processIdentity(pid){if(!Number.isInteger(pid)||pid<=0)return null;try{const r=spawnSync('ps',['-p',String(pid),'-o','lstart=','-o','stat='],{encoding:'utf8',timeout:1000,stdio:['ignore','pipe','ignore']});if(r.status!==0)return null;const fields=r.stdout.trim().split(/\s+/);const status=fields.pop();if(!status||status.startsWith('Z')||fields.length<5)return null;return fields.join(' ');}catch{return null;}}
export async function waitForSupervisor(job,{timeoutMs=2500}={}){if(!job.supervisorPid)return true;if(!job.supervisorIdentity){try{process.kill(job.supervisorPid,0);return false;}catch{return true;}}const deadline=Date.now()+timeoutMs;while(processIdentity(job.supervisorPid)===job.supervisorIdentity){if(Date.now()>=deadline)return false;await new Promise(r=>setTimeout(r,100));}return true;}
function supervise(){const args=process.argv.slice(2),separator=args.indexOf('--');const options=args.slice(0,separator);const get=name=>options[options.indexOf(name)+1];const owner=Number(get('--owner')),identity=get('--owner-identity'),job=get('--job');const command=args.slice(separator+1);if(separator<0||!identity||!job||!command.length||!Number.isInteger(owner)){process.exitCode=125;return;}
 const killGroup=()=>{try{process.kill(-process.pid,'SIGKILL');}catch{process.exit(125);}};
 if(processIdentity(owner)!==identity){killGroup();return;}
 const watchdog=setInterval(()=>{if(processIdentity(owner)!==identity)killGroup();},250);
 // Remain alive after group TERM so the owner can escalate even if provider ignores it.
 process.on('SIGTERM',()=>{});process.on('SIGINT',()=>{});
 let spawnFailed=false;const child=spawn(command[0],command.slice(1),{env:process.env,shell:false,detached:false,stdio:['pipe','inherit','inherit']});process.stdin.pipe(child.stdin);child.stdin.on('error',()=>{});child.on('error',()=>{spawnFailed=true;clearInterval(watchdog);process.exitCode=127;});child.on('close',(code,signal)=>{clearInterval(watchdog);process.stdin.unpipe(child.stdin);process.stdin.destroy();process.exitCode=spawnFailed?127:Number.isInteger(code)&&code>=0?code:signal?128:1;});
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)supervise();
