import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, readFile, realpath } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { PipelineManager } from '../pipeline.mjs';
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
async function until(predicate) { for (let i=0;i<300;i++) { if(await predicate()) return; await sleep(5); } throw Error('timed out'); }
async function fixture(t) {
 const root=await realpath(await mkdtemp(join(tmpdir(),'pipeline-safety-'))),cwd=join(root,'workspace'),claimsRoot=join(root,'claims'); await mkdir(cwd);await mkdir(join(cwd,'child'));
 const pipelines=[],managers=[];
 function create(options={}) { const jobs=new Map(),cancelled=[]; let sequence=0; const manager={stateDir:join(root,`profile-${managers.length}`),ready:Promise.resolve(),async start(){const id=String(++sequence);jobs.set(id,{id,status:'running'});return {id,status:'running'};},async readResult(id){return jobs.get(id);},async cancel(id){cancelled.push(id);jobs.get(id).status='cancelled';return jobs.get(id);}};Object.assign(manager,options);const pipeline=new PipelineManager({manager,claimsRoot,pollMs:2});pipelines.push(pipeline);managers.push(manager);return {pipeline,manager,jobs,cancelled}; }
 t.after(async()=>{await Promise.allSettled(pipelines.map(p=>p.shutdown()));await rm(root,{recursive:true,force:true});});return {root,cwd,claimsRoot,create};
}
test('separate profile state roots reject same canonical, ancestor and descendant workspaces',async t=>{
 const f=await fixture(t),a=f.create(),b=f.create(); const first=await a.pipeline.start({cwd:f.cwd,request:'one'});
 for(const cwd of [f.cwd,join(f.cwd,'child'),f.root])await assert.rejects(b.pipeline.start({cwd,request:'two'}),/active pipeline|workspace claim/i);
 await a.pipeline.cancel(first.id);
});
test('resume rejects cwd and request patches before config or state mutation',async t=>{
 const f=await fixture(t),a=f.create();const s=await a.pipeline.start({cwd:f.cwd,request:'original'});await a.pipeline.pause(s.id);
 const file=join(a.pipeline.stateDir,s.id,'config.json'),before=await readFile(file,'utf8');
 for(const patch of [{cwd:f.root},{request:'replacement'},{stageTimeoutSeconds:1},{unknown:true}]) {
  await assert.rejects(a.pipeline.resume({id:s.id,...patch}),/unsupported|unknown|not allowed/i);
  assert.equal(await readFile(file,'utf8'),before);
 }
});
test('unexpected readResult failure cancels the running child before claim release',async t=>{
 const f=await fixture(t),a=f.create({async readResult(){throw Error('storage read failed');}});const s=await a.pipeline.start({cwd:f.cwd,request:'one'});
 await until(()=>!a.pipeline.active.has(s.id)); assert.deepEqual(a.cancelled,['1']);assert.equal(a.jobs.get('1').status,'cancelled');
});
test('pause waits for delayed child stop and releases claim only after it resolves',async t=>{
 const f=await fixture(t),a=f.create(),b=f.create();let finishCancel;const gate=new Promise(resolve=>{finishCancel=resolve;});
 a.manager.cancel=async id=>{a.cancelled.push(id);await gate;a.jobs.get(id).status='cancelled';return a.jobs.get(id);};
 const s=await a.pipeline.start({cwd:f.cwd,request:'one'});await until(()=>a.jobs.size===1);
 let stopped=false;const pause=a.pipeline.pause(s.id).then(result=>{stopped=true;return result;});
 await until(()=>a.cancelled.length===1);assert.equal(stopped,false);
 await assert.rejects(b.pipeline.start({cwd:f.cwd,request:'two'}),/active pipeline|workspace claim/i);
 finishCancel();assert.equal((await pause).status,'paused');
 const next=await b.pipeline.start({cwd:f.cwd,request:'two'});await b.pipeline.cancel(next.id);
 const resumed=await a.pipeline.resume({id:s.id,provider:'claude',maxRepairRounds:1});assert.equal(resumed.status,'running');await a.pipeline.cancel(s.id);
 await assert.rejects(a.pipeline.resume({id:s.id}),/Terminal/);
});
test('save failure immediately after child start still awaits cancellation',async t=>{
 const f=await fixture(t),a=f.create(),b=f.create(),save=a.pipeline.save.bind(a.pipeline);let injected=false;
 a.pipeline.save=async s=>{if(!injected&&s.activeJobIds.length){injected=true;throw Error('persist failed');}return save(s);};
 const s=await a.pipeline.start({cwd:f.cwd,request:'one'});await until(()=>!a.pipeline.active.has(s.id));assert.deepEqual(a.cancelled,['1']);
 const state=await a.pipeline.readStatus(s.id);assert.equal(state.executionActive,false);assert.match(state.reason,/persist failed/);
 const next=await b.pipeline.start({cwd:f.cwd,request:'two'});await b.pipeline.cancel(next.id);
});
test('uncertain child cancellation retains global claim and marks execution active',async t=>{
 const f=await fixture(t),a=f.create({async readResult(){throw Error('read failed');},async cancel(){throw Error('cannot confirm child exit');}}),b=f.create();
 const s=await a.pipeline.start({cwd:f.cwd,request:'one'});await until(()=>!a.pipeline.active.has(s.id));
 const state=await a.pipeline.readStatus(s.id);assert.equal(state.executionActive,true);assert.deepEqual(state.activeJobIds,['1']);assert.match(state.cleanupError,/not confirmed/);
 await assert.rejects(b.pipeline.start({cwd:f.cwd,request:'two'}),/workspace claim/i);
 await assert.rejects(a.pipeline.resume({id:s.id}),/live owner/);
});
test('simultaneous separate-profile starts admit only one writer; sibling roots stay independent',async t=>{
 const f=await fixture(t),a=f.create(),b=f.create(),c=f.create();
 const started=await Promise.allSettled([a.pipeline.start({cwd:f.cwd,request:'a'}),b.pipeline.start({cwd:f.cwd,request:'b'})]);
 assert.equal(started.filter(x=>x.status==='fulfilled').length,1);assert.equal(started.filter(x=>x.status==='rejected').length,1);
 const sibling=join(f.root,'sibling');await mkdir(sibling);const job=await c.pipeline.start({cwd:sibling,request:'c'});await c.pipeline.cancel(job.id);
});
test('gracefully interrupted pipeline resumes in a replacement manager without sharing other tenant artifacts',async t=>{
 const f=await fixture(t),a=f.create();const s=await a.pipeline.start({cwd:f.cwd,request:'one'});await until(()=>a.jobs.size===1);await a.pipeline.shutdown();
 assert.equal((await a.pipeline.readStatus(s.id)).status,'interrupted');
 const replacement=f.create({stateDir:a.manager.stateDir});const resumed=await replacement.pipeline.resume({id:s.id});assert.equal(resumed.status,'running');
 const separate=f.create();await assert.rejects(separate.pipeline.start({cwd:f.cwd,request:'two'}),/workspace claim/i);assert.deepEqual(await separate.pipeline.list(),[]);
 await replacement.pipeline.cancel(s.id);
});
test('persistent pipeline save failure does not skip child cleanup or reject background promise',async t=>{
 const f=await fixture(t),a=f.create(),b=f.create(),save=a.pipeline.save.bind(a.pipeline);let spawned=false;
 a.pipeline.save=async s=>{if(s.activeJobIds.length)spawned=true;if(spawned)throw Error('disk unavailable');return save(s);};
 const s=await a.pipeline.start({cwd:f.cwd,request:'one'});const background=a.pipeline.active.get(s.id).promise;await background;
 assert.equal(a.jobs.get('1').status,'cancelled');assert.deepEqual(a.cancelled,['1']);assert.equal(a.pipeline.active.has(s.id),false);
 const next=await b.pipeline.start({cwd:f.cwd,request:'two'});await b.pipeline.cancel(next.id);
});
test('claim release failures remain visible in persisted pipeline status',async t=>{
 const f=await fixture(t),a=f.create({async readResult(){throw Error('read failed');}});
 a.pipeline.claims.release=async()=>{throw Error('registry write denied');};
 const s=await a.pipeline.start({cwd:f.cwd,request:'one'});await until(()=>!a.pipeline.active.has(s.id));
 const state=await a.pipeline.readStatus(s.id);assert.match(state.cleanupError,/Workspace claim retained: registry write denied/);assert.equal(state.executionActive,false);
});
test('verification phase is persisted before long-running checks begin',async t=>{
 const f=await fixture(t),a=f.create();const originalExecute=a.pipeline.execute.bind(a.pipeline);
 // Completed prerequisite artifacts let this fixture exercise execute's actual
 // development-to-verification boundary without invoking provider processes.
 a.pipeline.execute=async(s,c,active)=>{for(const r of s.roles)if(!['tester','reviewer'].includes(r.role))r.status='completed';return originalExecute(s,c,active);};
 let inspected=false;
 a.pipeline.verifier={async run(){const states=await a.pipeline.list();assert.equal(states.length,1);assert.equal(states[0].currentPhase,'verification');assert.equal(states[0].phases.find(p=>p.id==='verification').status,'running');inspected=true;throw Error('stop after phase inspection');}};
 const s=await a.pipeline.start({cwd:f.cwd,request:'one'});await until(()=>!a.pipeline.active.has(s.id));assert.equal(inspected,true);assert.match((await a.pipeline.readStatus(s.id)).reason,/stop after phase inspection/);
});
