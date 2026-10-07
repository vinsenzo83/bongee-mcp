import {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import {StdioServerTransport} from '@modelcontextprotocol/sdk/server/stdio.js';
import {z} from 'zod';
import {AgentManager} from './core.mjs';

const manager=new AgentManager();const server=new McpServer({name:'bongee',version:'0.1.0'});
const wrap=fn=>async args=>{try{return {content:[{type:'text',text:JSON.stringify(await fn(args))}]};}catch(error){return {isError:true,content:[{type:'text',text:error.message}]};}};
server.tool('provider_status','Check existing Codex and Claude CLI login without returning credentials.',{},wrap(()=>manager.providerStatus()));
server.tool('agent_start','Run an agent using an existing CLI login. Read-only is the default; workspace-write can edit files.',{provider:z.enum(['codex','claude']),prompt:z.string().min(1).max(100000),cwd:z.string().min(1),mode:z.enum(['read-only','workspace-write']).default('read-only'),timeoutSeconds:z.number().int().min(1).max(600).default(180)},wrap(args=>manager.start(args)));
server.tool('agent_status','Read agent progress.',{id:z.string()},wrap(async({id})=>{await manager.ready;return manager.status(id);}));
server.tool('agent_result','Read bounded agent output.',{id:z.string()},wrap(async({id})=>{await manager.ready;return manager.result(id);}));
server.tool('agent_cancel','Cancel a running process group.',{id:z.string()},wrap(({id})=>manager.cancel(id)));
server.tool('agent_list','List current and persisted agents.',{},wrap(()=>manager.list()));
const stop=async()=>{await manager.shutdown();await server.close();process.exit(0);};process.on('SIGTERM',stop);process.on('SIGINT',stop);
try{await manager.ready;await server.connect(new StdioServerTransport());}catch{process.stderr.write('Session agent server failed to initialize.\n');process.exit(1);}
