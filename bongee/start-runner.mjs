import {readFile} from 'node:fs/promises';import {homedir} from 'node:os';import {join,isAbsolute} from 'node:path';
const args=process.argv.slice(2);if(args.length&&!(args.length===2&&args[0]==='--config'&&isAbsolute(args[1])))throw Error('Usage: node start-runner.mjs [--config /absolute/profile.json]');
const config=JSON.parse(await readFile(args[1]||join(homedir(),'.config/bongee/gateway.json'),'utf8'));
if(config.principal){if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(config.principal))throw Error('Invalid connection principal');process.env.BONGEE_SESSION_STATE_DIR=join(homedir(),'.local/share/bongee/state',config.principal);}
const {GatewayRunner}=await import('./runner.mjs');const runner=new GatewayRunner({url:config.url,token:config.token,sessionLinkRoot:config.sessionLinkRoot});const stop=async()=>{await runner.stop();process.exit(0);};process.on('SIGINT',stop);process.on('SIGTERM',stop);await runner.run();
