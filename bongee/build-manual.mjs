import {readFile,writeFile,mkdir,readdir} from 'node:fs/promises';
const base=new URL('./docs/',import.meta.url);
const {tools,capturedAt}=JSON.parse(await readFile(new URL('tool-catalog.json',base),'utf8'));
const parity=JSON.parse(await readFile(new URL('catalog-parity.json',base),'utf8'));
const original=new Set(parity.originalNames);
const categories={agent:'에이전트 생성·실행·수명 관리',swarm:'스웜 구성·상태·협업',memory:'기억 저장·검색·이동',config:'설정 조회·변경',hooks:'작업 훅·모델 라우팅·학습',task:'작업 생성·배정·진행',session:'세션 저장·복구', 'hive-mind':'집단 에이전트 협업',workflow:'워크플로 생성·실행',analyze:'코드 차이·위험 분석',progress:'진행 상태 추적',embeddings:'임베딩 생성·벡터 검색',claims:'작업 소유권·인계',policy:'정책 평가',aidefence:'입력 방어·개인정보 검사',transfer:'패턴·플러그인·IPFS 연동',system:'시스템 상태·초기화',mcp:'MCP 서버 관리',terminal:'터미널 생성·명령 실행',neural:'신경망 학습·추론',performance:'성능 측정·최적화',github:'GitHub 저장소·PR·이슈',daa:'동적 자율 에이전트',coordination:'분산 작업 조정',browser:'브라우저 조작·기록',agentdb:'AgentDB 기억·그래프',ruvllm:'로컬 모델·벡터 라우팅',wasm:'WASM 에이전트·갤러리',managed:'관리형 클라우드 에이전트',guidance:'기능 탐색·사용 안내',autopilot:'자동 진행·학습',metaharness:'평가·보안·개선 루프',agenticow:'기억 분기·병합',federation:'연합 게시판·통신',x:'확장 연합망·채널',seraphina:'Seraphina 가이드',business:'사업 Pod 검증·백엔드 선택',http:'HTTP 요청',mission:'미션 계획·행동 요청',bongee:'Bongee 로그인 세션 실행',baton:'BATON 암호화 인계·팀·계정',spider:'BATON 검증 계획·신호'};
function group(t){return t.name.startsWith('bongee_remote_')?'remote':t.name.split('_')[0];}
function cell(s){return String(s??'—').replaceAll('|','\\|').replace(/\r?\n/g,'<br>');}
function type(s){return s.type||((s.anyOf||s.oneOf)?'분기 스키마':s.$ref?'$ref':'지정 없음');}
function example(s,key='value'){
 if(s.const!==undefined)return s.const;
 if(s.default!==undefined)return s.default;
 if(s.examples?.length)return s.examples[0];
 if(s.enum?.length)return s.enum[0];
 if(s.anyOf||s.oneOf)return example((s.anyOf||s.oneOf)[0],key);
 if(s.type==='object'||s.properties){const r={};for(const k of s.required||[])if(s.properties?.[k])r[k]=example(s.properties[k],k);return r;}
 if(s.type==='array')return Array.from({length:s.minItems||1},()=>example(s.items||{},key));
 if(s.type==='integer'||s.type==='number')return s.minimum??(s.exclusiveMinimum!==undefined?s.exclusiveMinimum+1:1);
 if(s.type==='boolean')return false;
 if(s.type==='null')return null;
 if(/api_key|token|secret/i.test(key))return '<본인 연결 권한 값>';
 if(/url|endpoint/i.test(key))return 'https://example.com';
 if(/cwd|path|directory/i.test(key))return '/absolute/path/my-project';
 if(/id$/i.test(key))return '<앞 단계에서 받은 ID>';
 return '<'+key+' 입력>';
}
function conditions(t){
 const s=JSON.stringify(t.inputSchema),d=t.description||'',g=group(t);
 const notes=[];
 if(g==='bongee'&&t.name!=='bongee_baton_status')notes.push(t.name==='bongee_agent_start'?'Codex 또는 Claude CLI 설치와 기존 로그인이 필요합니다.':'로컬 실행 기록/프로세스를 읽습니다. 조회 자체에는 AI API 키나 모델 호출이 필요하지 않습니다. provider_status는 CLI 설치·로그인 상태를 확인합니다.');
 if(g==='remote')notes.push('게이트웨이 연결 권한이 필요합니다. 실제 실행·로컬 도구 전달에는 켜진 실행기가 필요하며, agent_start에는 해당 CLI의 기존 로그인이 필요합니다. 상태 조회 자체는 모델을 호출하지 않습니다.');
 if(g==='baton'||g==='spider'||t.name==='bongee_baton_status')notes.push('BATON 서버 네트워크 연결. 계정 권한은 아래 실제 스키마의 api_key 등 필수 여부를 따릅니다. 익명 연결 성공은 모든 관리 기능의 사용 권한을 뜻하지 않습니다.');
 if(g==='github')notes.push('git/gh 설치와 대상 저장소 권한. 비공개 저장소·쓰기 작업에는 GitHub 로그인이 필요합니다.');
 if(g==='browser')notes.push('로컬 브라우저 실행 환경과 대상 사이트 접근 권한. 로그인 상태·쿠키는 대상 사이트별로 준비합니다.');
 if(g==='managed')notes.push('Anthropic 관리형 에이전트 서비스 연결·권한이 필요합니다. 로컬 로그인 세션 실행과 동일한 서비스가 아닙니다.');
 if(g==='wasm')notes.push('WASM 런타임/선택적 패키지와 모델 공급자 설정은 원본 구현을 따릅니다. 모든 WASM 모델 호출이 세션으로 대체된 것은 아닙니다.');
 if(['embeddings','neural','ruvllm','agentdb','agenticow'].includes(g))notes.push('원본의 선택적 DB·WASM·벡터/모델 패키지와 데이터가 필요할 수 있습니다. 초기 패키지·모델 다운로드와 실제 기능 사용 가능 여부를 확인합니다.');
 if(['transfer','federation','x','seraphina','http'].includes(g))notes.push('해당 원본 외부 서비스/네트워크/서명·계정 설정을 따릅니다. BATON 대체 기능은 별도 도구이며 원본 호출의 의미를 바꾸지 않습니다.');
 if(t.name==='agent_execute')notes.push('Bongee의 공통 모델 호출은 기본 Codex 로그인 세션을 사용합니다. 원본 설명에 남은 ANTHROPIC_API_KEY 요건은 원본 API 경로에 해당합니다. model/maxTokens/temperature 설정이 CLI 세션에서 원본 API와 완전히 같은 의미로 적용된다고 보장하지 않습니다.');
 if(/api_key|ANTHROPIC_API_KEY|requires.{0,30}(token|key|auth)/i.test(s+' '+d))notes.push('스키마·원본 설명에 계정/토큰 요건이 있습니다. 예시의 자리표시자를 실제 값으로 바꾸되 저장소에 커밋하지 마세요. AI 공급자 키와 서비스 접근 권한은 별개입니다.');
 if(!notes.length)notes.push('로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.');
 return notes.join('\n\n');
}
const groups=new Map();for(const t of tools){const g=group(t);if(!groups.has(g))groups.set(g,[]);groups.get(g).push(t);}
await mkdir(new URL('reference/',base),{recursive:true});
let index='# 전체 기능 상세 매뉴얼\n\n'+`카탈로그 수집: ${capturedAt}. 전체 **${tools.length}개**: Ruflo 원본 **${parity.originalCount}개**, Bongee 15개, BATON 45개, 원격 관리 6개. 원본 이름·입력 스키마 대조: 누락 ${parity.missing.length}개, 변경 ${parity.changedInputSchemas.length}개.\n\n`;
index+='[설치·기본 사용](USAGE.md) · [작업 순서 예제](WORKFLOWS.md) · [하단 상태 표시](STATUS-DISPLAY.md) · [전체 JSON 스키마](tool-catalog.json) · [대조 근거](catalog-parity.json)\n\n각 항목에 실제 도구 설명, 모든 입력 필드(중첩 포함), 전체 JSON 스키마, 필수 입력 호출 틀, 연결 조건을 수록했습니다. 원본 영어 설명은 의미를 보존하기 위해 그대로 병기합니다. 예시는 문서용 자리표시자이며 실제 실행 결과나 검증 성공을 뜻하지 않습니다. enum/범위/분기 조건은 전체 스키마가 최종 기준입니다.\n\n응답은 MCP content 배열과 선택적 isError로 받습니다. 도구별 출력 스키마가 제공되지 않은 경우 출력 형태를 추정하지 않습니다. 작업 ID 등은 실제 앞 단계의 응답에서 가져옵니다.\n\n원본 이름·입력의 동등성 검사는 전체 동작 동등성 검사가 아닙니다. 외부 서비스·선택적 패키지·계정 조건은 유지됩니다. 모델 호출의 세션 대체 차이는 agent_execute 항목에 명시합니다.\n\n| 분류 | 개수 | 상세 설명 |\n|---|---:|---|\n';
let documented=[];
for(const [g,entries] of groups){
 const label=g==='remote'?'원격 실행기 관리':categories[g]||g;
 index+=`| ${label} | ${entries.length} | [${g}](reference/${g}.md) |\n`;
 let out=`# ${label}\n\n[전체 목차](../MANUAL.md) · [사용 순서](../WORKFLOWS.md)\n\n`;
 for(const t of entries)out+=`- [${t.name}](#${t.name.toLowerCase()})\n`;
 for(const t of entries){
  documented.push(t.name);
  out+=`\n## ${t.name}\n\n출처: ${original.has(t.name)?'Ruflo 원본':g==='remote'?'Bongee 원격 관리':g==='bongee'?'Bongee 추가':'BATON 실제 서버'}\n\n### 기능과 사용 시점\n\n${t.description||'서버 설명 없음. 이름으로 동작을 추정하지 말고 구현을 확인하세요.'}\n\n### 연결·실행 조건\n\n${conditions(t)}\n\n### 입력 전체\n\n`;
  out+='| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |\n|---|---|---|---|---|\n';
  let rows=0;
  function fields(s,p=''){for(const [k,v]of Object.entries(s.properties||{})){rows++;const path=p?p+'.'+k:k;const constraints=Object.fromEntries(Object.entries(v).filter(([key])=>!['description','type','properties','items'].includes(key)));out+=`| ${cell(path)} | ${cell(type(v))} | ${(s.required||[]).includes(k)?'예'+(p?' (상위 제공 시)':''):'아니오'} | ${cell(v.description)} | ${cell(Object.keys(constraints).length?JSON.stringify(constraints):'—')} |\n`;fields(v,path);if(v.items)fields(v.items,path+'[]');}}
  fields(t.inputSchema);if(!rows)out+='| 없음 | — | — | 이름 있는 입력 필드 없음; 아래 스키마 확인 | — |\n';
  out+='\n전체 스키마(분기·패턴·추가 속성 규칙 포함):\n\n```json\n'+JSON.stringify(t.inputSchema,null,2)+'\n```\n';
  out+='\n### 호출 예시\n\n아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.\n\n```json\n'+JSON.stringify({name:t.name,arguments:example(t.inputSchema)},null,2)+'\n```\n';
  out+='\n### 결과 확인과 오류 대응\n\nMCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.\n';
  if(t.outputSchema)out+='\n제공된 출력 스키마:\n\n```json\n'+JSON.stringify(t.outputSchema,null,2)+'\n```\n';
  else out+='\n서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.\n';
 }
 await writeFile(new URL(`reference/${g}.md`,base),out);
}
index+='\n## 전체 도구 검색\n\n';for(const t of tools)index+=`- [${t.name}](reference/${group(t)}.md#${t.name.toLowerCase()})\n`;
await writeFile(new URL('MANUAL.md',base),index);
const missing=tools.filter(t=>!documented.includes(t.name)).map(t=>t.name);
if(missing.length||new Set(documented).size!==tools.length)throw Error('Manual coverage mismatch');
await writeFile(new URL('manual-coverage.json',base),JSON.stringify({toolCount:tools.length,documented:documented.length,originalCount:parity.originalCount,missing,groups:groups.size,fields:'Full input schemas retained',examples:'Templates, not live execution proofs'},null,2)+'\n');
console.log(JSON.stringify({documented:documented.length,groups:groups.size,missing}));
