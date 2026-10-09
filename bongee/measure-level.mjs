import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';
import {StreamableHTTPClientTransport} from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import {readFile,writeFile,mkdir,mkdtemp} from 'node:fs/promises';
import {homedir,tmpdir} from 'node:os';
import {join} from 'node:path';
import {performance} from 'node:perf_hooks';
const out=new URL('./output/level-assessment/',import.meta.url);await mkdir(out,{recursive:true});
const report={checkedAt:new Date().toISOString(),scope:'Read-only MCP transport and tool calls; no model generation or write tools',transports:{}};
function stats(rows){const ok=rows.filter(r=>r.ok),a=ok.map(r=>r.ms).sort((a,b)=>a-b);return {attempts:rows.length,passed:ok.length,failed:rows.length-ok.length,medianMs:a.length?+a[Math.floor(a.length/2)].toFixed(2):null,p95Ms:a.length?+a[Math.ceil(a.length*.95)-1].toFixed(2):null,maxMs:a.length?+a.at(-1).toFixed(2):null};}
async function measure(fn){const start=performance.now();try{const value=await fn();return {ok:!value?.isError,ms:performance.now()-start};}catch{return {ok:false,ms:performance.now()-start};}}
for(const mode of ['local','remote']){
 const client=new Client({name:'bongee-level-assessment',version:'1.0.0'});let transport;
 if(mode==='local'){const state=await mkdtemp(join(tmpdir(),'bongee-measure-'));transport=new StdioClientTransport({command:process.execPath,args:[new URL('./proxy-server.mjs',import.meta.url).pathname],env:{...process.env,BONGEE_SESSION_STATE_DIR:state},stderr:'pipe'});}
 else{const cfg=JSON.parse(await readFile(join(homedir(),'.config/bongee/gateway.json'),'utf8'));transport=new StreamableHTTPClientTransport(new URL(cfg.url+'/mcp'),{requestInit:{headers:{Authorization:'Bearer '+cfg.token}}});}
 try{const start=performance.now();await client.connect(transport);const data={connectionMs:+(performance.now()-start).toFixed(2)};report.transports[mode]=data;
 const catalog=(await client.listTools()).tools;data.toolCount=catalog.length;
 const original=JSON.parse(await readFile(new URL('./docs/catalog-parity.json',import.meta.url),'utf8')).originalNames;data.originalNamesMissing=original.filter(n=>!catalog.some(t=>t.name===n));
 const rows=[];for(let i=0;i<10;i++)rows.push(await measure(()=>client.listTools()));data.catalog=stats(rows);
 const status=[];for(let i=0;i<10;i++)status.push(await measure(()=>client.callTool({name:'system_status',arguments:{verbose:false}})));data.systemStatus=stats(status);
 const concurrent=[];for(let i=0;i<3;i++)concurrent.push(...await Promise.all(Array.from({length:5},()=>measure(()=>client.callTool({name:'system_status',arguments:{verbose:false}})))));data.concurrent5=stats(concurrent);
 const providers=await client.callTool({name:mode==='remote'?'bongee_remote_provider_status':'bongee_provider_status',arguments:{}});data.providerStatus=JSON.parse(providers.content[0].text);
 console.log(JSON.stringify({mode,...data}));
 }catch(e){report.transports[mode]={error:e.name};console.log(JSON.stringify({mode,error:e.name}));}finally{await client.close();}
}
await writeFile(new URL('results.json',out),JSON.stringify(report,null,2)+'\n');
