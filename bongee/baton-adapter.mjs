import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StreamableHTTPClientTransport} from '@modelcontextprotocol/sdk/client/streamableHttp.js';

export const DEFAULT_BATON_URL = 'https://baton-mcp-production.up.railway.app/mcp';
const diagnostic = (message) => ({isError:true,content:[{type:'text',text:message}]});

/** Forward the actual BATON catalog. Construction only performs MCP reads. */
export async function createBatonAdapter({url=process.env.BONGEE_BATON_URL || DEFAULT_BATON_URL,token=process.env.BONGEE_BATON_TOKEN,timeoutMs=10_000,reservedNames=[],clientFactory,transportFactory}={}) {
  const endpoint = new URL(url);
  if (endpoint.username || endpoint.password || endpoint.search || endpoint.hash) throw new Error('BATON URL must not contain credentials, query parameters, or a fragment');
  if (endpoint.protocol !== 'https:' && !(endpoint.protocol === 'http:' && ['localhost','127.0.0.1','[::1]'].includes(endpoint.hostname))) throw new Error('BATON URL must use HTTPS (HTTP allowed only on loopback)');
  const timeout = Number.isFinite(timeoutMs) && timeoutMs > 0 ? Math.min(timeoutMs,30_000) : 10_000;
  const client = clientFactory ? clientFactory() : new Client({name:'bongee-baton-adapter',version:'0.1.0'});
  const transportOptions = {requestInit:{headers: token ? {Authorization:`Bearer ${token}`} : {}}};
  const transport = transportFactory ? transportFactory(endpoint,transportOptions) : new StreamableHTTPClientTransport(endpoint,transportOptions);
  let connected=false,closed=false,error,catalog=[];
  const reserved=new Set(reservedNames);
  const bounded = async (action) => {
    let timer;
    try {return await Promise.race([action(),new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('timeout')),timeout);})]);}
    finally {clearTimeout(timer);}
  };
  const close = async () => {closed=true;connected=false;await Promise.allSettled([client.close(),transport.close()]);};
  try {
    await bounded(()=>client.connect(transport,{timeout}));
    const seen=new Set(),cursors=new Set(); let cursor;
    do {
      const page=await bounded(()=>client.listTools(cursor ? {cursor} : {},{timeout}));
      if (!Array.isArray(page.tools)) throw new Error('invalid catalog');
      for (const tool of page.tools) {
        if (!tool || typeof tool.name !== 'string' || !tool.inputSchema || seen.has(tool.name)) throw new Error('invalid or duplicate tool');
        seen.add(tool.name);catalog.push(tool);
      }
      cursor=page.nextCursor;
      if (cursor) {if(cursors.has(cursor))throw new Error('pagination loop');cursors.add(cursor);}
      if (cursors.size > 100) throw new Error('pagination limit');
    } while(cursor);
    connected=true;
  } catch {
    error='BATON connection or tool discovery failed; check endpoint, network, and optional account token.';
    catalog=[];await close();
  }
  const tools = (existingNames=[]) => {
    const conflicts=new Set([...reserved,...existingNames]);
    return connected ? catalog.filter(tool=>!conflicts.has(tool.name)).map(tool=>structuredClone(tool)) : [];
  };
  const call = async (name,args={}) => {
    if (!connected || closed) return diagnostic('BATON is disconnected; reconnect before calling remote tools.');
    if (reserved.has(name)) return diagnostic('BATON tool conflicts with an existing tool; original handler is preserved.');
    if (!catalog.some(tool=>tool.name === name)) return diagnostic('Tool is not present in the discovered BATON catalog.');
    try {return await bounded(()=>client.callTool({name,arguments:args},undefined,{timeout}));}
    catch {return diagnostic('BATON tool call failed or timed out. Remote write outcome may be unknown; do not retry writes automatically.');}
  };
  const status = async ({account=false}={}) => {
    const result={connected:connected&&!closed,url:endpoint.toString(),toolCount:connected?catalog.length:0,tokenConfigured:!!token,conflicts:catalog.filter(tool=>reserved.has(tool.name)).map(tool=>tool.name),...(error?{error}:{}),authentication:'An optional BATON account token does not guarantee every tool is keyless.'};
    if(account && connected && catalog.some(tool=>tool.name==='baton_account')) result.account=await call('baton_account',{});
    return result;
  };
  return {tools,call,close,status};
}
