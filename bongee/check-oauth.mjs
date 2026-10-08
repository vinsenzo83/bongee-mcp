import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StreamableHTTPClientTransport} from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import {InMemoryOAuthClientProvider} from '@modelcontextprotocol/sdk/examples/client/simpleOAuthClientProvider.js';
import {UnauthorizedError} from '@modelcontextprotocol/sdk/client/auth.js';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {join} from 'node:path';import {homedir} from 'node:os';
import {spawn} from 'node:child_process';

const endpoint=new URL(process.env.BONGEE_CHECK_URL||'https://bongee-production.up.railway.app/mcp');
let cookie='';
if(process.argv.includes('--owner')){
 const config=JSON.parse(await readFile(join(homedir(),'.config/bongee/gateway.json'),'utf8'));
 const response=await fetch(new URL('/owner/bootstrap',endpoint),{method:'POST',headers:{Authorization:'Bearer '+config.token,'Content-Type':'application/json'},body:'{}'});
 if(!response.ok)throw Error('Owner bootstrap failed');const bootstrap=await response.json();const result=await fetch(bootstrap.url,{redirect:'manual'});if(![302,303].includes(result.status))throw Error('Bootstrap redemption failed');cookie=result.headers.get('set-cookie')?.split(';')[0]||'';
}
let authorizationUrl;
const provider=new InMemoryOAuthClientProvider('http://127.0.0.1:43199/callback',{client_name:'Bongee URL install verification',redirect_uris:['http://127.0.0.1:43199/callback'],grant_types:['authorization_code','refresh_token'],response_types:['code'],token_endpoint_auth_method:'none'},url=>{authorizationUrl=url;});
let client=new Client({name:'bongee-oauth-check',version:'0.3.0'}),transport=new StreamableHTTPClientTransport(endpoint,{authProvider:provider});
try{await client.connect(transport);throw Error('Expected OAuth discovery');}catch(error){if(!(error instanceof UnauthorizedError))throw error;}
if(!authorizationUrl)throw Error('OAuth authorization was not discovered automatically');
const page=await fetch(authorizationUrl,{headers:cookie?{Cookie:cookie}:undefined});if(!page.ok)throw Error('Consent page failed');cookie=page.headers.get('set-cookie')?.split(';')[0]||cookie;const html=await page.text(),csrf=html.match(/name="csrf"\s+value="([^"]+)"/)?.[1];if(!csrf)throw Error('Consent form is missing');
const consent=await fetch(new URL('/authorize',endpoint),{method:'POST',headers:{Cookie:cookie,Origin:endpoint.origin,'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({csrf,decision:'allow'}),redirect:'manual'});
if(consent.status!==303)throw Error('Consent failed');const redirect=new URL(consent.headers.get('location'));if(redirect.searchParams.get('iss')!==endpoint.origin)throw Error('Authorization issuer mismatch');await transport.finishAuth(redirect.searchParams.get('code'));await client.close();
client=new Client({name:'bongee-oauth-check',version:'0.3.0'});transport=new StreamableHTTPClientTransport(endpoint,{authProvider:provider});await client.connect(transport);
try{
 const tools=(await client.listTools()).tools,stateReply=await client.callTool({name:'bongee_remote_provider_status',arguments:{}});if(stateReply.isError)throw Error('Provider status failed');const state=JSON.parse(stateReply.content[0].text);
 const evidence={endpoint:endpoint.href,urlOnlyOAuth:true,tokenCopied:false,tools:tools.length,runnerConnected:state.connected,providers:state.providers,owner:process.argv.includes('--owner')};
 if(process.argv.includes('--auto-install')){const setup=JSON.parse((await client.callTool({name:'bongee_auto_setup',arguments:{}})).content[0].text);if(!setup.ready){if(typeof setup.command!=='string'||!/^curl -fsS 'https:\/\/bongee-production\.up\.railway\.app\/install\/session\/[A-Za-z0-9_-]{43}' \| node --input-type=module$/.test(setup.command))throw Error('Unexpected automatic setup command');console.log('Automatic session preparation started; no manual ZIP or token input.');const code=await new Promise((resolve,reject)=>{const child=spawn('bash',['-c',setup.command],{stdio:['ignore','inherit','inherit']});child.once('error',reject);child.once('close',resolve);});if(code!==0)throw Error('Automatic session setup failed');}const readyReply=await client.callTool({name:'bongee_auto_setup',arguments:{}});const readiness=JSON.parse(readyReply.content[0].text);if(readiness.ready!==true)throw Error('Automatic setup has not connected');evidence.automaticExecutorInstalled=true;evidence.runnerConnected=true;const original=await client.callTool({name:'system_status',arguments:{verbose:false}});if(original.isError)throw Error('New executor tool forwarding failed');evidence.originalToolExecuted=true;}
 if(evidence.owner){const reply=await client.callTool({name:'system_status',arguments:{verbose:false}});evidence.originalToolExecuted=!reply.isError;if(reply.isError)throw Error('OAuth owner forwarding failed');}
 console.log(JSON.stringify(evidence));await mkdir(new URL('./output/',import.meta.url),{recursive:true});await writeFile(new URL('./output/oauth-check-'+(evidence.owner?'owner':'guest')+'.json',import.meta.url),JSON.stringify(evidence,null,2));
}finally{await client.close();}
