import {Server} from '@modelcontextprotocol/sdk/server/index.js';
import {StdioServerTransport} from '@modelcontextprotocol/sdk/server/stdio.js';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';
import {ListToolsRequestSchema,CallToolRequestSchema} from '@modelcontextprotocol/sdk/types.js';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';
import {AgentManager} from './core.mjs';
import {createBatonAdapter} from './baton-adapter.mjs';
const manager=new AgentManager();await manager.ready;
const runtime=join(dirname(fileURLToPath(import.meta.resolve('@claude-flow/cli'))),'../..');
const upstream=new Client({name:'bongee-upstream',version:'0.1.0'});
const child=new StdioClientTransport({command:process.execPath,args:[join(runtime,'bin/cli.js'),'mcp','start'],env:{...process.env,RUFLO_SESSION_PROVIDER:process.env.BONGEE_SESSION_PROVIDER||'codex',RUFLO_SESSION_TIMEOUT_MS:'300000'},stderr:'inherit'});
await upstream.connect(child);
const upstreamCatalog=(await upstream.listTools()).tools;
const baton=await createBatonAdapter({reservedNames:upstreamCatalog.map(t=>t.name)});
const schema={type:'object',properties:{id:{type:'string'}},required:['id']};
const extras=[
 {name:'bongee_baton_status',description:'Read BATON handoff/room connection status without writing.',inputSchema:{type:'object',properties:{}}},
 {name:'bongee_provider_status',description:'Check existing Codex and Claude CLI login. No API credentials returned.',inputSchema:{type:'object',properties:{}}},
 {name:'bongee_agent_start',description:'Execute a real Codex or Claude CLI agent with existing login. Default read-only. Poll status/result. New CLI session, not a copy of this conversation.',inputSchema:{type:'object',properties:{provider:{type:'string',enum:['codex','claude']},prompt:{type:'string',maxLength:100000},cwd:{type:'string'},mode:{type:'string',enum:['read-only','workspace-write'],default:'read-only'},timeoutSeconds:{type:'integer',minimum:1,maximum:600}},required:['provider','prompt','cwd']}},
 {name:'bongee_agent_status',description:'Read actual agent execution state.',inputSchema:schema},
 {name:'bongee_agent_result',description:'Read actual final response and session ID; unfinished is not completed.',inputSchema:schema},
 {name:'bongee_agent_cancel',description:'Stop a session-agent process group.',inputSchema:schema},
 {name:'bongee_agent_list',description:'List session executions.',inputSchema:{type:'object',properties:{}}}
];
const server=new Server({name:'bongee',version:'0.1.0'},{capabilities:{tools:{}}});
server.setRequestHandler(ListToolsRequestSchema,async()=>{let tools=[],cursor;do{const page=await upstream.listTools(cursor?{cursor}:{});tools.push(...page.tools);cursor=page.nextCursor;}while(cursor);return {tools:[...tools,...extras,...baton.tools([...tools,...extras].map(t=>t.name))]};});
server.setRequestHandler(CallToolRequestSchema,async request=>{const {name,arguments:a={}}=request.params;
 if(baton.tools().some(t=>t.name===name))return baton.call(name,a);
 if(!extras.some(t=>t.name===name))return upstream.callTool(request.params,undefined,{timeout:660000});
 try{let result;switch(name){case 'bongee_baton_status':result=await baton.status();break;case 'bongee_provider_status':result=await manager.providerStatus();break;case 'bongee_agent_start':result=await manager.start(a);break;case 'bongee_agent_status':result=await manager.readStatus(a.id);break;case 'bongee_agent_result':result=await manager.readResult(a.id);break;case 'bongee_agent_cancel':result=await manager.cancel(a.id);break;case 'bongee_agent_list':result=await manager.list();}return {content:[{type:'text',text:JSON.stringify(result)}]};}catch(e){return {isError:true,content:[{type:'text',text:e.message}]};}
});
let closing=false;async function stop(){if(closing)return;closing=true;await manager.shutdown();await baton.close();await upstream.close();await server.close();process.exit(0);}process.on('SIGINT',stop);process.on('SIGTERM',stop);process.stdin.on('end',stop);
await server.connect(new StdioServerTransport());
