import {readDesktopMonitor} from './connection-status.mjs';
import {footer} from './monitor.mjs';
import {readFile} from 'node:fs/promises';
import {spawn} from 'node:child_process';
let raw='';for await(const data of process.stdin){raw+=data;if(raw.length>1024*1024){raw='';break;}}
let payload={};try{payload=JSON.parse(raw);}catch{}
const previous=process.argv.indexOf('--previous-config');
if(previous>=0){try{const cfg=JSON.parse(await readFile(process.argv[previous+1],'utf8'));if(typeof cfg.command==='string'&&cfg.command.trim())await new Promise(resolve=>{const child=spawn(cfg.command,{shell:true,stdio:['pipe','pipe','ignore'],detached:process.platform!=='win32'});let out='',settled=false;const finish=()=>{if(settled)return;settled=true;clearTimeout(timer);if(out.trim())process.stdout.write(out.trimEnd()+'\n');resolve();};const timer=setTimeout(()=>{try{process.kill(-child.pid,'SIGTERM');}catch{child.kill();}finish();},1000);child.stdout.on('data',d=>{out=(out+d).slice(0,8192);});child.stdin.on('error',()=>{});child.on('error',finish);child.on('close',finish);child.stdin.end(raw);});}catch{}}
try{const cwd=payload.workspace?.current_dir||payload.cwd||process.cwd();process.stdout.write(footer(await readDesktopMonitor({cwd}))+'\n');}catch{process.stdout.write('bongee | 상태 확인 불가\n');}
