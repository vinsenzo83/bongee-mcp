import {transform} from 'esbuild';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';
const runtime=join(dirname(fileURLToPath(import.meta.resolve('@claude-flow/cli'))),'../..');
for(const name of ['agent-execute-core','cli-session-provider']){
 const source=await readFile(new URL('../v3/@claude-flow/cli/src/mcp-tools/'+name+'.ts',import.meta.url),'utf8');
 const compiled=await transform(source,{loader:'ts',format:'esm',target:'node20'});
 const dest=join(runtime,'dist/src/mcp-tools',name+'.js');await mkdir(dirname(dest),{recursive:true});await writeFile(dest,compiled.code);
}
console.log('bongee: login-session provider added; upstream tool registry preserved.');
