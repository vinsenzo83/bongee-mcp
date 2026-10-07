import {mkdir,writeFile} from 'node:fs/promises';
import {AgentManager} from './core.mjs';
import {PipelineManager} from './pipeline.mjs';
import {readMonitor} from './monitor-state.mjs';
const cwd='/Users/vinsenzo/output/bongee-mcp/pipeline-live-demo';
await mkdir(cwd,{recursive:true});
await writeFile(cwd+'/package.json',JSON.stringify({private:true,type:'module',scripts:{test:'node --test'}}));
// This check is intentionally broken. A real developer must repair the service
// and, after first verification fails, remove this explicit test defect.
await writeFile(cwd+'/acceptance.test.mjs',`import test from 'node:test';import assert from 'node:assert/strict';import {draw} from './draw.mjs';
test('winner is a supplied participant',()=>assert.ok(['a','b'].includes(draw(['a','b']))));
test('empty entry rejected',()=>assert.throws(()=>draw([])));
test('intentional verification defect',()=>assert.equal(1,2));\n`);
const manager=new AgentManager();const pipelines=new PipelineManager({manager});
const started=await pipelines.start({cwd,provider:'codex',maxRepairRounds:3,stageTimeoutSeconds:600,request:'Build a dependency-free Bongee lucky draw module draw.mjs exporting draw(participants). Randomly select exactly one nonempty string entry; reject empty array and invalid entries. Provide README usage. Preserve existing first two acceptance tests and add invalid entry tests. The test named intentional verification defect must remain in initial implementation so we can verify the correction loop. Only after first real verification reports that test failure, remove that intentionally false test. This is a controlled integration test, not a production deployment. No UI required. Planner define at most 4 requirements focused on service functionality, tests and README; do not treat intentionally broken first test run as final requirement.'});
console.log(JSON.stringify({id:started.id,cwd}));let previous='';
while(true){const s=await pipelines.readStatus(started.id);const line=JSON.stringify({status:s.status,phase:s.currentPhase,round:s.round,roles:s.roles.map(r=>r.role+':'+r.status)});if(line!==previous){console.log(line);previous=line;}if(!['running','queued'].includes(s.status)){const result=await pipelines.readResult(s.id);await writeFile('/Users/vinsenzo/output/bongee-mcp/pipeline-live-results.json',JSON.stringify({result,monitor:await readMonitor({cwd})},null,2));await pipelines.shutdown();await manager.shutdown();if(s.status!=='completed'||s.round<1)process.exitCode=1;break;}await new Promise(r=>setTimeout(r,1000));}
