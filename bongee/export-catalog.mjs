import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StreamableHTTPClientTransport} from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import {readFile,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {homedir} from 'node:os';
// Read-only catalog discovery. Never export connection credentials.
const cfg=JSON.parse(await readFile(join(homedir(),'.config/bongee/gateway.json'),'utf8'));
const client=new Client({name:'bongee-manual-catalog',version:'0.1.0'});
try {
 await client.connect(new StreamableHTTPClientTransport(new URL(cfg.url+'/mcp'),{requestInit:{headers:{Authorization:'Bearer '+cfg.token}}}));
 const tools=[];let cursor;
 do {const page=await client.listTools(cursor?{cursor}:{});tools.push(...page.tools);cursor=page.nextCursor;}while(cursor);
 if(tools.length<410)throw Error('Full runner catalog unavailable');
 await writeFile(new URL('./docs/tool-catalog.json',import.meta.url),JSON.stringify({capturedAt:new Date().toISOString(),source:'MCP tools/list (read-only)',tools},null,2)+'\n');
 console.log(JSON.stringify({tools:tools.length}));
}finally{await client.close();}
