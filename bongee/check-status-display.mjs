import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import {footer} from './monitor.mjs';
const cwd=fileURLToPath(new URL('.',import.meta.url));
const client=new Client({name:'bongee-status-verifier',version:'0.1.2'});
const parse=r=>{if(r.isError)throw Error(r.content[0]?.text||'Tool failed');return JSON.parse(r.content.find(c=>c.type==='text').text);};
try{
 await client.connect(new StdioClientTransport({command:process.execPath,args:[fileURLToPath(new URL('./proxy-server.mjs',import.meta.url))],cwd,stderr:'ignore'}));
 const spawned=parse(await client.callTool({name:'agent_spawn',arguments:{agentType:'planner',task:'Bongee footer lifecycle verification'}}));
 const id=spawned.agentId;if(!id)throw Error('No original agent ID');
 const execution=client.callTool({name:'agent_execute',arguments:{agentId:id,prompt:'도구를 사용하지 말고 BONGEE_FOOTER_OK만 답하세요.'}},undefined,{timeout:180000});
 let running;
 for(let i=0;i<30;i++){await new Promise(r=>setTimeout(r,100));const s=parse(await client.callTool({name:'bongee_monitor_status',arguments:{cwd}}));if(s.agents.some(a=>a.id===id&&a.status==='running')){running=s;break;}}
 const result=parse(await execution);if(result.success!==true||!result.output?.includes('BONGEE_FOOTER_OK'))throw Error('Original role session execution failed');
 const finished=parse(await client.callTool({name:'bongee_monitor_status',arguments:{cwd}}));
 if(!running||!finished.agents.some(a=>a.id===id&&a.status==='completed'))throw Error('Role lifecycle not visible');
 const rendered=await new Promise((resolve,reject)=>{const child=spawn(process.execPath,[fileURLToPath(new URL('./statusline.mjs',import.meta.url))],{stdio:['pipe','pipe','pipe']});let out='';child.stdout.on('data',d=>out+=d);child.on('error',reject);child.on('close',code=>code===0?resolve(out):reject(Error('Footer failed')));child.stdin.end(JSON.stringify({cwd}));});
 if(!rendered.includes('기획:응답 완료'))throw Error('Footer did not render completion');
 const evidence={toolCount:(await client.listTools()).tools.length,role:'planner',id,runningFooter:footer(running),completedFooter:rendered.trim(),actualModelEcho:result.output,verifiedAt:new Date().toISOString()};
 await mkdir(new URL('./output/',import.meta.url),{recursive:true});await writeFile(new URL('./output/status-display-check.json',import.meta.url),JSON.stringify(evidence,null,2)+'\n');console.log(JSON.stringify(evidence));
 await client.callTool({name:'agent_terminate',arguments:{agentId:id}});
}finally{await client.close();}
