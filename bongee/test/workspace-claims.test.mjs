import test from 'node:test';import assert from 'node:assert/strict';
import { mkdtemp,realpath,mkdir,rm,readdir,readFile,stat,symlink,chmod } from 'node:fs/promises';
import {tmpdir} from 'node:os';import{join}from'node:path';import{spawn}from'node:child_process';
import{WorkspaceClaims,workspacesOverlap}from'../workspace-claims.mjs';
const moduleURL=new URL('../workspace-claims.mjs',import.meta.url).href;
async function fixture(t){const dir=await realpath(await mkdtemp(join(tmpdir(),'workspace-claims-'))),root=join(dir,'claims'),cwd=join(dir,'workspace');await mkdir(cwd);t.after(()=>rm(dir,{recursive:true,force:true}));return{dir,root,cwd};}
function child(code,args){return new Promise((resolve,reject)=>{const p=spawn(process.execPath,['--input-type=module','-e',code,...args],{stdio:['ignore','pipe','pipe']});let output='',error='';p.stdout.on('data',x=>output+=x);p.stderr.on('data',x=>error+=x);p.on('error',reject);p.on('exit',code=>code===0?resolve(output.trim()):reject(Error(error)));});}
test('independent OS processes coordinate private workspace claims despite different profile roots',async t=>{
 const f=await fixture(t);const code=`import{WorkspaceClaims}from ${JSON.stringify(moduleURL)};process.env.BONGEE_SESSION_STATE_DIR=process.argv[3];const c=new WorkspaceClaims({root:process.argv[1]});try{await c.acquire(process.argv[2],'pipeline');console.log('ACQUIRED');}catch(e){if(!e.message.includes('workspace claim'))throw e;console.log('BLOCKED');}`;
 const results=await Promise.all([child(code,[f.root,f.cwd,'profileA']),child(code,[f.root,f.cwd,'profileB'])]);assert.deepEqual(results.sort(),['ACQUIRED','BLOCKED']);
 const claims=new WorkspaceClaims({root:f.root});await assert.rejects(claims.acquire(f.cwd,'restart'),/unresolved workspace claim/);
 const record=JSON.parse(await readFile(join(f.root,(await readdir(f.root))[0]),'utf8'));assert.equal('stateDir'in record,false);assert.equal('request'in record,false);
 assert.equal((await stat(f.root)).mode&0o777,0o700);assert.equal((await stat(join(f.root,record.token+'.json'))).mode&0o777,0o600);
});
test('canonical symlink cwd overlaps, registry symlinks and untrusted record modes fail closed',async t=>{
 const f=await fixture(t),a=new WorkspaceClaims({root:f.root});const claim=await a.acquire(f.cwd,'a');const alias=join(f.dir,'workspace-alias');await symlink(f.cwd,alias);
 await assert.rejects(new WorkspaceClaims({root:f.root}).acquire(alias,'b'),/workspace claim/);
 const registryAlias=join(f.dir,'claims-alias');await symlink(f.root,registryAlias);await assert.rejects(new WorkspaceClaims({root:registryAlias}).ready,/Unsafe/);
 const file=join(f.root,claim.token+'.json');await chmod(file,0o644);await assert.rejects(a.acquire(join(f.dir),'c'),/Unsafe/);await chmod(file,0o600);await a.release(claim);
 const next=await a.acquire(f.cwd,'next');await assert.rejects(new WorkspaceClaims({root:f.root}).release(next),/owner mismatch/);await a.release(next);
 assert.equal(workspacesOverlap('/','/anywhere'),true);assert.equal(workspacesOverlap('/a','/ab'),false);
});
