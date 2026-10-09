import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {GatewayRunner} from '../runner.mjs';

test('remote credentials stay isolated unless an explicit shared local root is selected',()=>{
 const make=(token,extra={})=>new GatewayRunner({url:'https://example.test',token,manager:{},...extra});
 const a=make('fixture-a'),b=make('fixture-b');
 assert.notEqual(a.sessionLinkRoot,b.sessionLinkRoot);
 assert.equal(a.sessionLinkRoot,make('fixture-a').sessionLinkRoot);
 assert.equal(a.sessionLinkRoot.includes('fixture-a'),false);
 const root=join(tmpdir(),'explicit-owned-session-group');
 assert.equal(make('fixture-a',{sessionLinkRoot:root}).sessionLinkRoot,make('fixture-b',{sessionLinkRoot:root}).sessionLinkRoot);
 assert.throws(()=>make('fixture-a',{sessionLinkRoot:'relative'}),/absolute/);
});

test('runner profile namespace is shared by manager monitor and pipeline, and excludes API secrets',async t=>{
 const dir=await mkdtemp(join(tmpdir(),'bongee-profile-'));t.after(()=>rm(dir,{recursive:true,force:true}));
 const code=`import {AgentManager,safeEnv} from './core.mjs';import {STATE_DIR} from './monitor-state.mjs';import {PipelineManager} from './pipeline.mjs';const manager=new AgentManager();await manager.ready;const engine=new PipelineManager({manager});await engine.ready;console.log(JSON.stringify({manager:manager.stateDir,monitor:STATE_DIR,pipeline:engine.stateDir,env:safeEnv({BONGEE_SESSION_STATE_DIR:process.env.BONGEE_SESSION_STATE_DIR,OPENAI_API_KEY:'private',ANTHROPIC_API_KEY:'private'})}));await engine.shutdown();await manager.shutdown();`;
 const run=spawnSync(process.execPath,['--input-type=module','-e',code],{cwd:new URL('../',import.meta.url),env:{...process.env,BONGEE_SESSION_STATE_DIR:dir},encoding:'utf8'});
 assert.equal(run.status,0,run.stderr);const result=JSON.parse(run.stdout);assert.equal(result.manager,dir);assert.equal(result.monitor,dir);assert.equal(result.pipeline,join(dir,'pipelines'));assert.deepEqual(result.env,{BONGEE_SESSION_STATE_DIR:dir});
});

test('runner rejects malformed profile principal before connecting',async t=>{
 const dir=await mkdtemp(join(tmpdir(),'bongee-invalid-profile-'));t.after(()=>rm(dir,{recursive:true,force:true}));const path=join(dir,'config.json');await writeFile(path,JSON.stringify({principal:'owner',url:'https://example.test',token:'private-placeholder'}));const run=spawnSync(process.execPath,[new URL('../start-runner.mjs',import.meta.url).pathname,'--config',path],{encoding:'utf8'});assert.notEqual(run.status,0);assert.match(run.stderr,/Invalid connection principal/);assert.equal(run.stderr.includes('private-placeholder'),false);
});
