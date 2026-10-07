import {readFile,writeFile,mkdir,copyFile,rename} from 'node:fs/promises';
import {homedir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
const args=process.argv.slice(2),dir=join(homedir(),'.claude'),file=join(dir,'settings.json'),backup=join(dir,'bongee-statusline-backup.json'),previous=join(dir,'bongee-statusline-previous.json');
const quote=s=>"'"+s.replaceAll("'","'\\''")+"'";
await mkdir(dir,{recursive:true,mode:0o700});let config={};try{config=JSON.parse(await readFile(file,'utf8'));}catch(e){if(e.code!=='ENOENT')throw Error('Cannot read existing Claude settings; no changes made');}
const script=fileURLToPath(new URL('./statusline.mjs',import.meta.url));
if(args.includes('--uninstall')){let old;try{old=JSON.parse(await readFile(backup,'utf8'));}catch{throw Error('No Bongee statusline backup found');}if(!config.statusLine?.command?.includes(script))throw Error('Status line changed since installation; no settings overwritten');if(old.statusLine===undefined)delete config.statusLine;else config.statusLine=old.statusLine;}
else if(!config.statusLine?.command?.includes(script)){
 await writeFile(backup,JSON.stringify({statusLine:config.statusLine},null,2)+'\n',{mode:0o600});
 await writeFile(previous,JSON.stringify({command:config.statusLine?.command||''})+'\n',{mode:0o600});
 config.statusLine={type:'command',command:quote(process.execPath)+' '+quote(script)+' --previous-config '+quote(previous),padding:config.statusLine?.padding||0,refreshInterval:2};
}
const temp=file+'.bongee.tmp';await writeFile(temp,JSON.stringify(config,null,2)+'\n',{mode:0o600});await rename(temp,file);
console.log(args.includes('--uninstall')?'Previous Claude status line restored.':'Bongee Claude footer installed; existing status line retained. Codex: node monitor.mjs --watch --cwd /project/path');
