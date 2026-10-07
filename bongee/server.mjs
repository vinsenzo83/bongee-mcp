import {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import {StdioServerTransport} from '@modelcontextprotocol/sdk/server/stdio.js';
import {z} from 'zod';
import {AgentManager} from './core.mjs';
import {PipelineManager} from './pipeline.mjs';
import {pipelineTools,callPipeline} from './pipeline-tools.mjs';

const manager=new AgentManager();const pipelines=new PipelineManager({manager});const server=new McpServer({name:'bongee',version:'0.2.0'});
const wrap=fn=>async args=>{try{return {content:[{type:'text',text:JSON.stringify(await fn(args))}]};}catch(error){return {isError:true,content:[{type:'text',text:error.message}]};}};
server.tool('provider_status','Check existing Codex and Claude CLI login without returning credentials.',{},wrap(()=>manager.providerStatus()));
server.tool('agent_start','Run a role-labeled agent using an existing CLI login. Read-only is the default; workspace-write can edit files.',{provider:z.enum(['codex','claude']),prompt:z.string().min(1).max(100000),cwd:z.string().min(1),role:z.string().min(1).max(80).optional(),name:z.string().min(1).max(80).optional(),phase:z.enum(['planning','design','development','verification']).optional(),mode:z.enum(['read-only','workspace-write']).default('read-only'),timeoutSeconds:z.number().int().min(1).max(600).default(180)},wrap(args=>manager.start(args)));
server.tool('agent_status','Read agent progress.',{id:z.string()},wrap(async({id})=>{await manager.ready;return manager.readStatus(id);}));
server.tool('agent_result','Read bounded agent output.',{id:z.string()},wrap(async({id})=>{await manager.ready;return manager.readResult(id);}));
server.tool('agent_cancel','Cancel a running process group.',{id:z.string()},wrap(({id})=>manager.cancel(id)));
server.tool('agent_list','List current and persisted agents.',{},wrap(()=>manager.list()));
const roleProviders=z.object(Object.fromEntries(['planner','researcher','architect','designer','developer','tester','reviewer'].map(r=>[r,z.enum(['codex','claude']).optional()]))).strict();
const check=z.object({id:z.string().optional(),label:z.string().optional(),command:z.string(),args:z.array(z.string())}).strict();
const shared={provider:z.enum(['codex','claude']).optional(),providers:roleProviders.optional(),checks:z.array(check).max(32).optional(),maxRepairRounds:z.number().int().min(0).max(20).optional()};
for(const tool of pipelineTools){const shape=tool.name.endsWith('_start')?{cwd:z.string().min(1),request:z.string().min(1).max(60000),...shared,stageTimeoutSeconds:z.number().int().min(1).max(600).optional(),checkTimeoutSeconds:z.number().int().min(1).max(600).optional()}:tool.name.endsWith('_list')?{cwd:z.string().optional()}:tool.name.endsWith('_resume')?{id:z.string(),...shared}:tool.name.endsWith('_result')?{id:z.string(),historyOffset:z.number().int().min(0).optional(),historyLimit:z.number().int().min(1).max(10).optional(),includeCurrent:z.boolean().optional()}:{id:z.string()};server.tool(tool.name,tool.description,shape,wrap(args=>callPipeline(pipelines,tool.name,args)));}
const stop=async()=>{await pipelines.shutdown();await manager.shutdown();await server.close();process.exit(0);};process.on('SIGTERM',stop);process.on('SIGINT',stop);
try{await manager.ready;await server.connect(new StdioServerTransport());}catch{process.stderr.write('Session agent server failed to initialize.\n');process.exit(1);}
