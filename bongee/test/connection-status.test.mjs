import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,rm,readFile,cp} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {fileURLToPath} from 'node:url';
import {recordConnection,readConnection,readDesktopMonitor} from '../connection-status.mjs';
import {footer} from '../monitor.mjs';
const exec=promisify(execFile);
async function fixture(t){const dir=await mkdtemp(join(tmpdir(),'bongee-footer-'));t.after(()=>rm(dir,{recursive:true,force:true}));return dir;}
test('connection badge requires recent successful heartbeat and live owner',async t=>{
 const dir=await fixture(t),now=Date.now();assert.deepEqual(await readConnection(dir),{known:false,connected:0});
 await recordConnection(dir,{connected:true,now});assert.equal((await readConnection(dir,{now})).connected,1);
 assert.equal((await readConnection(dir,{now:now+15000})).connected,0);
 assert.equal((await readConnection(dir,{now:now-1})).connected,0);
 assert.equal((await readConnection(dir,{now,alive:()=>false})).connected,0);
 await recordConnection(dir,{connected:false,now});assert.deepEqual(await readConnection(dir,{now}),{known:true,connected:0});
});
test('desktop footer reads remote profile jobs but retains project scope and excludes secrets',async t=>{
 const home=await fixture(t),cwd=join(home,'project'),dir=join(home,'.local/share/bongee/state/11111111-1111-1111-1111-111111111111');await mkdir(dir,{recursive:true});
 await writeFile(join(dir,'a.json'),JSON.stringify({id:'a',cwd,role:'developer',status:'running',ownerPid:process.pid,prompt:'PRIVATE'}));
 await writeFile(join(dir,'b.json'),JSON.stringify({id:'b',cwd:home,role:'tester',status:'running',ownerPid:process.pid}));await recordConnection(dir,{connected:true});
 const s=await readDesktopMonitor({home,cwd});assert.equal(s.counts.running,1);assert.equal(s.agents[0].id,'a');assert.match(footer(s),/실행기 연결됨 1개/);assert.match(footer(s),/개발:실행 중/);assert.doesNotMatch(JSON.stringify(s),/PRIVATE/);
});
test('old runner records do not hide a current connection after many restarts',async t=>{
 const dir=await fixture(t),now=Date.now();for(let pid=100000;pid<100101;pid++)await recordConnection(dir,{connected:true,now:now-60000,pid});await recordConnection(dir,{connected:true,now,pid:999999});
 assert.equal((await readConnection(dir,{now,alive:pid=>pid===999999})).connected,1);
});
test('upgrading footer path preserves original command without chaining old Bongee wrappers',async t=>{
 const home=await fixture(t),dir=join(home,'.claude');await mkdir(dir);const file=join(dir,'settings.json');const original={type:'command',command:'printf original'};await writeFile(file,JSON.stringify({statusLine:original}));
 const script=fileURLToPath(new URL('../install-statusline.mjs',import.meta.url)),env={...process.env,HOME:home};await exec(process.execPath,[script],{env});
 const upgrade=join(home,'new-version');await mkdir(upgrade);await cp(script,join(upgrade,'install-statusline.mjs'));await exec(process.execPath,[join(upgrade,'install-statusline.mjs')],{env});
 assert.equal(JSON.parse(await readFile(join(dir,'bongee-statusline-previous.json'))).command,original.command);assert.deepEqual(JSON.parse(await readFile(join(dir,'bongee-statusline-backup.json'))).statusLine,original);
 assert.match(JSON.parse(await readFile(file)).statusLine.command,/new-version/);await exec(process.execPath,[join(upgrade,'install-statusline.mjs'),'--uninstall'],{env});assert.deepEqual(JSON.parse(await readFile(file)).statusLine,original);
});
