import {randomBytes} from 'node:crypto';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {homedir} from 'node:os';
import {join} from 'node:path';
import {spawn} from 'node:child_process';
const dir=join(homedir(),'.config/bongee');await mkdir(dir,{recursive:true,mode:0o700});const file=join(dir,'gateway.json');let config;try{config=JSON.parse(await readFile(file,'utf8'));}catch{config={token:randomBytes(32).toString('hex')};await writeFile(file,JSON.stringify(config),{mode:0o600});}
const child=spawn('railway',['variable','set','BONGEE_GATEWAY_TOKEN','--stdin','--skip-deploys','--service','bongee'],{stdio:['pipe','pipe','pipe']});child.stdout.resume();child.stderr.resume();child.stdin.end(config.token);child.on('close',code=>{console.log(code===0?'Gateway connection token configured; stored privately.':'Gateway configuration failed.');process.exitCode=code||0;});
