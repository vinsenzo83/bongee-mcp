import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StreamableHTTPClientTransport} from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {homedir} from 'node:os';
const cfg=JSON.parse(await readFile(homedir()+'/.config/bongee/gateway.json','utf8'));
const c=new Client({name:'bongee-monitor-read-check',version:'0.1.2'});
try{
 await c.connect(new StreamableHTTPClientTransport(new URL(cfg.url+'/mcp'),{requestInit:{headers:{Authorization:'Bearer '+cfg.token}}}));
 const tools=(await c.listTools()).tools;
 const schema=tools.find(t=>t.name==='bongee_remote_agent_start')?.inputSchema;
 if(!schema?.properties?.role||!tools.some(t=>t.name==='bongee_monitor_status'))throw Error('New monitor/catalog not deployed');
 const result=await c.callTool({name:'bongee_monitor_status',arguments:{cwd:new URL('.',import.meta.url).pathname}},undefined,{timeout:65000});
 if(result.isError)throw Error('Remote monitor call failed');const state=JSON.parse(result.content[0].text);
 if(state.phases?.length!==4)throw Error('No four-stage state');
 const evidence={verifiedAt:new Date().toISOString(),tools:tools.length,remoteRoleInput:true,phases:state.phases,counts:state.counts};
 await mkdir(new URL('./output/',import.meta.url),{recursive:true});await writeFile(new URL('./output/remote-monitor-check.json',import.meta.url),JSON.stringify(evidence,null,2)+'\n');console.log(JSON.stringify(evidence));
}finally{await c.close();}
