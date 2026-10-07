# bongee 검증 범위

2026-10-07. 원본 source: ruvnet/ruflo, upstream commit9fa701a, release3.54.1. 원본 파일 삭제0개, MIT 고지 유지. 원본 전체 기능의 구조·코드는 보존하지만 모든 외부 서비스의 실행 성공을 의미하지 않는다.

- 로컬 MCP: Ruflo358 + 세션/상태8 + BATON45 =411 도구 (BATON 네트워크 연결 성공 시).
- 원격 MCP: 위411 + 원격 실행기 관리6 =417 도구. 실제 HTTPS catalog 확인.
- 원본 system_status 원격 호출 성공.
- 원본 agent_spawn / agent_execute 도구도 별도 API키 없이 Codex 로그인 세션으로 실행해 정상 응답을 관측했다.
- BATON SDK listTools45개, 익명 account 읽기 및 연결 상태 확인. 캡슐/방 생성·메시지 전송은 이번 검증에서 하지 않았다.
- 별도 API키 없이 기존 ChatGPT 로그인 Codex CLI를 bongee 도구로 실행하고 정상 응답 관측.
- 원격 서버→로컬 실행기→Codex 로그인→정상 응답까지 실제 관측.
- Claude CLI 로그인은 정상 환경에서 확인. 실호출은 주간 사용 한도에 걸렸으며 is_error:true를 실패로 기록. Claude 성공 실행은 아직 검증되지 않았다.
- 단위/실제 로컬 HTTP 통합34개 통과. 세션 공급자 추가 집중 Vitest6개는 upstream 프로젝트 전체빌드 대신 임시 격리config/cwd shim으로 실행됐다.

## v0.1.2 역할별 하단 표시

- 기획 / 설계·디자인 / 개발 / 검증 네 단계와 역할별 실제 상태·공급자·경과 시간. 단계 자동 실행이나 임의 진행률은 제공하지 않는다.
- 원본 planner agent_spawn + agent_execute를 실제 Codex 로그인으로 실행하여 실행 중→응답 완료를 관찰했다. 응답 BONGEE_FOOTER_OK. 로컬 근거 output/status-display-check.json.
- 원격 monitor_status 전달, 전체417개 카탈로그, remote_agent_start의 role/name/phase 입력을 실제 HTTPS에서 확인했다. 근거 output/remote-monitor-check.json.
- Claude 하단 상태줄 설치기는 기존 명령 보존·반복 설치·복구·다른 설정 유지 검사를 통과했다. 사용자PC 설정에도 설치했으며 상태줄 스크립트 출력은 검증했다. Claude 앱 화면의 시각 검증 및 Claude 모델 성공 실행과 구분한다.
- Codex의 공식 내장 상태줄 설정에는 임의 MCP 상태 명령 주입이 확인되지 않아 별도 터미널 모니터를 제공한다. Codex 앱 하단 UI를 직접 변경했다고 주장하지 않는다.
- 실제 실행 없이 등록 정보만 busy인 에이전트는 등록:busy로 표시하며 실행 중 수에 포함하지 않는다. 모니터가 원본 저장 상태를 수정하지 않는 것을 검증했다.
- 원본358개 이름·입력 스키마 누락0개·변경0개. 상세 매뉴얼417개에 새 상태 도구 포함.
- 기존 원격 서비스 배포0fa70f0f-4982-483a-b4e0-1287e5003b7d SUCCESS 및 최신 실행기 연결 확인.

키·CLI 로그인 정보·실행 원문·사용자 경로를 공개 ZIP에 포함하지 않는다. 실행 기록은 사용자PC의 비공개 디렉토리에 보관한다. 서버 연결 토큰은 비공개 환경설정으로만 관리한다.

현재 원격 기록은 서버 메모리 저장이며 재시작/재배포 시 사라진다. 실행기는 한 소유자의 PC에 연결돼 있다. 공유 서비스 사용자는 연결 권한 없이 이 PC에서 명령을 실행할 수 없다. 다운로드한 다른 사용자는 각자 로컬 MCP를 설치하고 자신의 CLI 로그인을 사용한다.

IPFS 영구파일 pinning·Nostr 연합망과 BATON 작업 인계·팀 방은 동일 기능이라고 표시하지 않는다. 기존 `wasm_agent_*`는 API provider gate와 가상 샌드박스가 별도로 존재해 현재 세션 provider만으로 모든 WASM 모델 경로가 활성화되지 않는다. 원본 cloud Managed Agents 역시 자체 API 서비스가 필요하다.
