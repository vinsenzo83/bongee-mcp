import test from 'node:test';
import assert from 'node:assert/strict';
import {createBatonAdapter} from '../baton-adapter.mjs';
const tool=name=>({name,description:name,inputSchema:{type:'object',properties:{}}});
function fake(overrides={}) {
  const calls=[];let closes=0;
  const client={async connect(){},async listTools(){return{tools:[tool('baton_pass'),tool('baton_receive'),tool('baton_account')]}},async callTool(params){calls.push(params);return{content:[{type:'text',text:'ok'}]}},async close(){closes++},...overrides};
  return {calls,clientFactory:()=>client,transportFactory:()=>({async close(){}}),closes:()=>closes};
}
test('construction discovers actual catalog without capsule, room, or account writes',async()=>{
  const stub=fake();const adapter=await createBatonAdapter(stub);
  assert.equal(adapter.tools().length,3);assert.equal(stub.calls.length,0);
  assert.equal((await adapter.status()).connected,true);await adapter.close();
});
test('forwards only discovered tools and preserves schemas',async()=>{
  const stub=fake();const adapter=await createBatonAdapter(stub);
  assert.deepEqual(adapter.tools()[0],tool('baton_pass'));
  const unknown=await adapter.call('imaginary',{});assert.equal(unknown.isError,true);assert.equal(stub.calls.length,0);
  await adapter.call('baton_receive',{code:'BTN-H-test'});assert.deepEqual(stub.calls,[{name:'baton_receive',arguments:{code:'BTN-H-test'}}]);await adapter.close();
});
test('existing tools retain names and original handlers',async()=>{
  const stub=fake();const adapter=await createBatonAdapter({...stub,reservedNames:['baton_pass']});
  assert.deepEqual(adapter.tools().map(t=>t.name),['baton_receive','baton_account']);
  assert.equal((await adapter.call('baton_pass',{})).isError,true);assert.equal(stub.calls.length,0);await adapter.close();
});
test('only explicit optional token enters Authorization, not tool arguments',async()=>{
  const stub=fake();let headers;
  const adapter=await createBatonAdapter({...stub,token:'test-token',transportFactory:(_url,opts)=>{headers=opts.requestInit.headers;return{async close(){}}}});
  assert.equal(headers.Authorization,'Bearer test-token');await adapter.status({account:true});
  assert.deepEqual(stub.calls,[{name:'baton_account',arguments:{}}]);await adapter.close();
});
test('failed connection stays nonfatal and conceals diagnostics',async()=>{
  const stub=fake({async connect(){throw new Error('secret-token')}});const adapter=await createBatonAdapter(stub);
  assert.equal((await adapter.status()).connected,false);assert.deepEqual(adapter.tools(),[]);
  assert.equal((await adapter.call('baton_pass')).isError,true);assert(!JSON.stringify(await adapter.status()).includes('secret-token'));
});
test('pagination retrieves full catalog',async()=>{
  const stub=fake({async listTools(args){return args.cursor ? {tools:[tool('baton_send')]} : {tools:[tool('baton_inbox')],nextCursor:'next'}}});
  const adapter=await createBatonAdapter(stub);assert.deepEqual(adapter.tools().map(t=>t.name),['baton_inbox','baton_send']);await adapter.close();
});
test('timeouts do not issue writes or claim connectivity',async()=>{
  const stub=fake({async connect(){return new Promise(()=>{})}});const adapter=await createBatonAdapter({...stub,timeoutMs:5});
  assert.equal((await adapter.status()).connected,false);assert.equal(stub.calls.length,0);assert(stub.closes()>0);
});
test('rejects credentials embedded in endpoint URLs',async()=>{
  await assert.rejects(()=>createBatonAdapter({url:'https://user:password@example.com/mcp'}),/credentials/);
});
