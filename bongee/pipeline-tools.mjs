const obj=(properties={},required=[])=>({type:'object',properties,required,additionalProperties:false});
const provider={type:'string',enum:['codex','claude']};
const providers=obj(Object.fromEntries(['planner','researcher','architect','designer','developer','tester','reviewer'].map(r=>[r,provider])));
const checks={type:'array',maxItems:32,items:obj({id:{type:'string'},label:{type:'string'},command:{type:'string'},args:{type:'array',items:{type:'string'}}},['command','args'])};
const shared={provider,providers,checks,maxRepairRounds:{type:'integer',minimum:0,maximum:20,default:3}};
const id={type:'string',description:'Pipeline ID returned by start'};
export const pipelineTools=[
 {name:'bongee_pipeline_start',description:'Automatically run actual planner+researcher → architect+designer → developer → real test commands+tester+reviewer. Handoff validated artifacts; repair and reverify failures. Returns pipeline ID immediately. Developer edits the target project. Separate CLI login sessions; not merely registry records.',inputSchema:obj({cwd:{type:'string',description:'Existing target project absolute path'},request:{type:'string',minLength:1,maxLength:60000,description:'Complete user goal and constraints'},...shared,stageTimeoutSeconds:{type:'integer',minimum:1,maximum:600,default:600},checkTimeoutSeconds:{type:'integer',minimum:1,maximum:600,default:300}},['cwd','request'])},
 {name:'bongee_pipeline_status',description:'Read actual automatic pipeline progress, roles, rounds and reasons; no model invocation.',inputSchema:obj({id},['id'])},
 {name:'bongee_pipeline_result',description:'Read pipeline artifacts, verification receipts, role history and final outcome. Start/completed agent text alone does not mean verified completion.',inputSchema:obj({id},['id'])},
 {name:'bongee_pipeline_list',description:'List persistent automatic pipeline jobs, optionally scoped to project.',inputSchema:obj({cwd:{type:'string'}})},
 {name:'bongee_pipeline_pause',description:'Pause the automatic pipeline and stop active agent/check work. Already written files remain. Resume reruns uncertain work.',inputSchema:obj({id},['id'])},
 {name:'bongee_pipeline_resume',description:'Resume paused/interrupted/failed pipeline from confirmed artifacts; optionally change provider/checks/repair cap. Cannot seize a live owner or skip verification.',inputSchema:obj({id,...shared},['id'])},
 {name:'bongee_pipeline_cancel',description:'Cancel pipeline and active agent/test processes. Does not revert files or external changes.',inputSchema:obj({id},['id'])}
];
export async function callPipeline(pipelines,name,args={}){
 switch(name){case 'bongee_pipeline_start':return pipelines.start(args);case 'bongee_pipeline_status':return pipelines.readStatus(args.id);case 'bongee_pipeline_result':return pipelines.readResult(args.id);case 'bongee_pipeline_list':return pipelines.list(args);case 'bongee_pipeline_pause':return pipelines.pause(args.id);case 'bongee_pipeline_resume':return pipelines.resume(args);case 'bongee_pipeline_cancel':return pipelines.cancel(args.id);default:throw Error('Unknown pipeline tool');}
}
