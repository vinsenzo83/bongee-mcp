import {randomBytes,createHash,randomUUID} from 'node:crypto';
import {mkdir,open,writeFile,rename} from 'node:fs/promises';
import {constants} from 'node:fs';
import {dirname,resolve} from 'node:path';

const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const digest=token=>createHash('sha256').update(token).digest('hex');
const principalError=()=>new Error('Authenticated tenant principal required');
/** Principals must originate from verified OAuth/admin middleware, never HTTP body/query. */
export class TenantStore{
 constructor({ownerPrincipal='owner',statePath,maxTenants=64,maxJobs=100,maxActiveJobs=20}={}){
  if(typeof ownerPrincipal!=='string'||!ownerPrincipal||ownerPrincipal.length>128||/[\x00-\x1f\x7f]/.test(ownerPrincipal))throw Error('Invalid owner principal');
  for(const [name,value,max] of [['maxTenants',maxTenants,1024],['maxJobs',maxJobs,1000],['maxActiveJobs',maxActiveJobs,1000]])if(!Number.isInteger(value)||value<1||value>max)throw Error('Invalid '+name);
  if(maxActiveJobs>maxJobs)throw Error('Active job limit exceeds job limit');
  Object.assign(this,{ownerPrincipal,statePath:statePath?resolve(statePath):undefined,maxTenants,maxJobs,maxActiveJobs});this.tenants=new Map();this.credentials=new Map();this.persistQueue=Promise.resolve();this.mutationQueue=Promise.resolve();this.ready=this.restore();
 }
 validatePrincipal(principal){if(typeof principal!=='string'||(principal!==this.ownerPrincipal&&!uuid.test(principal)))throw principalError();return principal;}
 get(principal,{create=true}={}){this.validatePrincipal(principal);if(this.tenants.has(principal))return this.tenants.get(principal);if(!create)return null;if(this.tenants.size>=this.maxTenants)throw Error('Tenant capacity reached');const tenant={principal,runner:{lastSeen:0,providers:[],catalog:[]},jobs:new Map()};this.tenants.set(principal,tenant);return tenant;}
 async restore(){if(!this.statePath)return;let handle;try{handle=await open(this.statePath,constants.O_RDONLY|constants.O_NOFOLLOW);const stat=await handle.stat();if(!stat.isFile()||stat.size>512000||(stat.mode&0o077)!==0)throw Error('Invalid private tenant credential file');const parsed=JSON.parse(await handle.readFile('utf8'));if(parsed.version!==1||!Array.isArray(parsed.credentials)||parsed.credentials.length>this.maxTenants)throw Error('Invalid tenant credential state');const seen=new Set();for(const item of parsed.credentials){this.validatePrincipal(item.principal);if(typeof item.hash!=='string'||! /^[0-9a-f]{64}$/.test(item.hash)||seen.has(item.principal)||this.credentials.has(item.hash))throw Error('Invalid tenant credential state');seen.add(item.principal);this.get(item.principal);this.credentials.set(item.hash,item.principal);}}catch(e){if(e.code!=='ENOENT')throw e;}finally{await handle?.close();}}
 async persist(){if(!this.statePath)return;const serialized=JSON.stringify({version:1,credentials:[...this.credentials].map(([hash,principal])=>({principal,hash}))});const op=this.persistQueue.catch(()=>{}).then(async()=>{await mkdir(dirname(this.statePath),{recursive:true,mode:0o700});const tmp=this.statePath+'.'+randomUUID()+'.tmp';await writeFile(tmp,serialized,{mode:0o600,flag:'wx'});await rename(tmp,this.statePath);});this.persistQueue=op;await op;}
 async serializeMutation(operation){const previous=this.mutationQueue;let release;this.mutationQueue=new Promise(r=>release=r);await previous;try{return await operation();}finally{release();}}
 async provisionRunner(principal){return this.serializeMutation(async()=>{await this.ready;this.validatePrincipal(principal);this.get(principal);const token='bgr_'+randomBytes(32).toString('base64url'),hash=digest(token),old=[...this.credentials].filter(([,p])=>p===principal);for(const [h]of old)this.credentials.delete(h);this.credentials.set(hash,principal);try{await this.persist();}catch(e){this.credentials.delete(hash);for(const [h,p]of old)this.credentials.set(h,p);throw e;}return {principal,runnerToken:token};});}
 /** Purpose separation is mandatory: runner credentials never authorize MCP access. */
 resolveCredential(token,purpose){if(purpose!=='runner'||typeof token!=='string'||token.length<40||token.length>128)return null;return this.credentials.get(digest(token))||null;}
 resolveRunnerToken(token){return this.resolveCredential(token,'runner');}
 async revokeRunner(principal){return this.serializeMutation(async()=>{await this.ready;this.validatePrincipal(principal);const previous=[...this.credentials];for(const [h,p]of previous)if(p===principal)this.credentials.delete(h);try{await this.persist();}catch(e){this.credentials=new Map(previous);throw e;}});}
 addJob(principal,job){const tenant=this.get(principal);if(!job||typeof job.id!=='string'||!uuid.test(job.id)||tenant.jobs.has(job.id))throw Error('Invalid or duplicate job');if(!['queued','running','completed','failed','cancelled','timed-out','interrupted'].includes(job.status))throw Error('Invalid job status');if(['queued','running'].includes(job.status)&&[...tenant.jobs.values()].filter(j=>['queued','running'].includes(j.status)).length>=this.maxActiveJobs)throw Error('Agent queue is full');this.trim(principal,this.maxJobs-1);if(tenant.jobs.size>=this.maxJobs)throw Error('Job capacity reached');tenant.jobs.set(job.id,job);return job;}
 trim(principal,limit=this.maxJobs){const jobs=this.get(principal).jobs;for(const [id,job]of jobs){if(jobs.size<=limit)break;if(!['queued','running'].includes(job.status))jobs.delete(id);}}
 getJob(principal,id){const job=this.get(principal,{create:false})?.jobs.get(id);if(!job)throw Error('Unknown agent');return job;}
 listJobs(principal){return [...(this.get(principal,{create:false})?.jobs.values()||[])];}
}
export const createTenantStore=options=>new TenantStore(options);
