import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';
import {writeFile,mkdir} from 'node:fs/promises';
const client=new Client({name:'bongee-verifier',version:'0.1.0'});
const transport=new StdioClientTransport({command:process.execPath,args:[new URL('./proxy-server.mjs',import.meta.url).pathname],stderr:'inherit'});
try{await client.connect(transport);const listed=await client.listTools();console.log(JSON.stringify({toolCount:listed.tools.length,namespacedTools:listed.tools.filter(t=>t.name.startsWith('bongee_')).map(t=>t.name)}));
 const auth=await client.callTool({name:'bongee_provider_status',arguments:{}});console.log(JSON.stringify({auth}));
 if(process.argv.includes('--execute')){
  const provider=process.argv.includes('--claude')?'claude':'codex';
  const result=await client.callTool({name:'bongee_agent_start',arguments:{provider,cwd:new URL('.',import.meta.url).pathname,prompt:'도구를 사용하지 말고 BONGEE_SESSION_OK만 답하세요.',timeoutSeconds:180}});if(result.isError)throw Error(result.content[0].text);const job=JSON.parse(result.content[0].text);console.log(JSON.stringify({started:job.id}));
  let status;for(let i=0;i<180;i++){await new Promise(r=>setTimeout(r,1000));const r=await client.callTool({name:'bongee_agent_result',arguments:{id:job.id}});status=JSON.parse(r.content[0].text);if(status.status!=='running')break;}
  const evidence={provider,toolCount:listed.tools.length,status:status.status,sessionId:status.sessionId,finalResult:status.finalResult};await mkdir(new URL('./output/',import.meta.url),{recursive:true});await writeFile(new URL('./output/'+provider+'-check.json',import.meta.url),JSON.stringify(evidence,null,2));console.log(JSON.stringify(evidence));if(status.status!=='completed'||!status.finalResult?.includes('BONGEE_SESSION_OK'))throw Error('Actual session execution did not complete');
 }
}finally{await client.close();}
