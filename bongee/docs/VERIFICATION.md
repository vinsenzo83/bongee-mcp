# bongee 검증 범위

2026-10-07. 원본 source: ruvnet/ruflo, upstream commit9fa701a, release3.54.1. 원본 파일 삭제0개, MIT 고지 유지. 원본 전체 기능의 구조·코드는 보존하지만 모든 외부 서비스의 실행 성공을 의미하지 않는다.

- 로컬 MCP: Ruflo358 + 세션/상태7 + BATON45 =410 도구 (BATON 네트워크 연결 성공 시).
- 원격 MCP: 위410 + 원격 실행기 관리6 =416 도구. 실제 HTTPS catalog 확인.
- 원본 system_status 원격 호출 성공.
- BATON SDK listTools45개, 익명 account 읽기 및 연결 상태 확인. 캡슐/방 생성·메시지 전송은 이번 검증에서 하지 않았다.
- 별도 API키 없이 기존 ChatGPT 로그인 Codex CLI를 bongee 도구로 실행하고 정상 응답 관측.
- 원격 서버→로컬 실행기→Codex 로그인→정상 응답까지 실제 관측.
- Claude CLI 로그인은 정상 환경에서 확인. 실호출은 주간 사용 한도에 걸렸으며 is_error:true를 실패로 기록. Claude 성공 실행은 아직 검증되지 않았다.
- 단위/실제 로컬 HTTP 통합27개 통과. 세션 공급자 추가 집중 Vitest6개는 upstream 프로젝트 전체빌드 대신 임시 격리config/cwd shim으로 실행됐다.

키·CLI 로그인 정보·실행 원문·사용자 경로를 공개 ZIP에 포함하지 않는다. 실행 기록은 사용자PC의 비공개 디렉토리에 보관한다. 서버 연결 토큰은 비공개 환경설정으로만 관리한다.

현재 원격 기록은 서버 메모리 저장이며 재시작/재배포 시 사라진다. 실행기는 한 소유자의 PC에 연결돼 있다. 공유 서비스 사용자는 연결 권한 없이 이 PC에서 명령을 실행할 수 없다. 다운로드한 다른 사용자는 각자 로컬 MCP를 설치하고 자신의 CLI 로그인을 사용한다.

IPFS 영구파일 pinning·Nostr 연합망과 BATON 작업 인계·팀 방은 동일 기능이라고 표시하지 않는다. 기존 `wasm_agent_*`는 API provider gate와 가상 샌드박스가 별도로 존재해 현재 세션 provider만으로 모든 WASM 모델 경로가 활성화되지 않는다. 원본 cloud Managed Agents 역시 자체 API 서비스가 필요하다.
