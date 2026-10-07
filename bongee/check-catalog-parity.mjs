import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';
import {readFile,writeFile} from 'node:fs/promises';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
const runtime=join(dirname(fileURLToPath(import.meta.resolve('@claude-flow/cli'))),'../..');
const client=new Client({name:'bongee-parity',version:'0.1.0'});
try {
 await client.connect(new StdioClientTransport({command:process.execPath,args:[join(runtime,'bin/cli.js'),'mcp','start'],stderr:'inherit'}));
 const original=[];let cursor;
 do{const p=await client.listTools(cursor?{cursor}:{});original.push(...p.tools);cursor=p.nextCursor;}while(cursor);
 const catalog=JSON.parse(await readFile(new URL('./docs/tool-catalog.json',import.meta.url),'utf8'));
 const map=new Map(catalog.tools.map(t=>[t.name,t]));
 const missing=original.filter(t=>!map.has(t.name)).map(t=>t.name);
 const changed=original.filter(t=>map.has(t.name)&&JSON.stringify(t.inputSchema)!==JSON.stringify(map.get(t.name).inputSchema)).map(t=>t.name);
 const report={checkedAt:new Date().toISOString(),originalCount:original.length,documentedCount:catalog.tools.length,missing,changedInputSchemas:changed,originalNames:original.map(t=>t.name),scope:'Tool names and input schemas; not full runtime behavioral equivalence'};
 await writeFile(new URL('./docs/catalog-parity.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({original:original.length,documented:catalog.tools.length,missing,changedInputSchemas:changed}));
 if(missing.length||changed.length||original.length!==358)process.exitCode=1;
}finally{await client.close();}
