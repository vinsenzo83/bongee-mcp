# 실제 작업 순서와 운영 방법

[전체 417개 도구 상세 설명](MANUAL.md) · [설치](../README.md) · [세션 하단 상태 표시](STATUS-DISPLAY.md)

## 1. 설치 후 첫 실행

1. Node.js 20 이상과 Codex 또는 Claude Code CLI를 설치합니다.
2. 저장소를 내려받아 bongee 폴더에서 npm install을 실행합니다. ZIP을 받았다면 압축을 풀고 같은 폴더에서 실행합니다.
3. 사용할 CLI에서 codex login 또는 claude auth login을 실행합니다. API 키를 채팅에 붙여넣을 필요가 없습니다.
4. README의 mcp add 명령에 설치한 proxy-server.mjs의 절대 경로를 넣습니다.
5. 클라이언트를 재시작하고 bongee_provider_status로 로그인 상태, bongee_baton_status로 BATON 연결을 확인합니다.

`bongee로 현재 사용 가능한 기능과 로그인 상태를 확인하고 /absolute/path/my-project를 읽기 전용으로 검토해`라고 요청할 수 있습니다. 자연어 요청은 클라이언트가 도구 호출로 변환합니다. 실제 호출 이름·인자를 확인하려면 실행한 도구 기록을 보세요.

## 2. Codex·Claude로 코드 작업

bongee_agent_start에 다음 입력을 보냅니다. cwd는 본인 PC에 존재하는 프로젝트 폴더로 바꿉니다.

```json
{
  "provider": "codex",
  "cwd": "/absolute/path/my-project",
  "mode": "workspace-write",
  "timeoutSeconds": 300,
  "prompt": "이 프로젝트의 추첨 중복 발생 원인을 확인하고 수정해. 기존 사용자 변경을 보존하고 관련 테스트를 실행해. 변경 파일, 결과, 미검증 범위를 보고해."
}
```

반환된 id를 bongee_agent_status와 bongee_agent_result에 전달합니다. 실행 중이면 기다렸다가 다시 조회합니다. completed면 finalResult와 파일 변경·테스트 근거를 확인합니다. failed, timed-out, cancelled, interrupted는 완료 성공이 아닙니다. 읽기 검토는 mode를 read-only로 바꾸고 수정 요청을 빼세요. Claude를 쓰려면 provider를 claude로 바꿉니다.

새 작업은 새 CLI 세션이며 기존 채팅 맥락은 자동 복제되지 않습니다. 관련 파일·문제·완료 조건을 prompt에 담으세요. 기본 시간 제한은 180초, 최대 600초이고 프로세스당 동시 2개입니다. 긴 프로젝트를 한 번에 완료했다고 추정하지 말고 작업을 나누고 결과를 점검합니다.

Codex workspace-write는 CLI 샌드박스를 사용합니다. Claude는 Read/Glob/Grep 또는 Edit/Write 도구 제한을 사용하므로 운영체제 샌드박스와 같지 않습니다. Claude 세션 실행의 현재 도구 구성에는 Bash가 없으므로 모든 테스트 명령이 그 에이전트 안에서 실행 가능한 것은 아닙니다. 필요한 명령은 호스트의 터미널 실행 권한과 별도로 확인합니다.

## 3. 원본 에이전트 기록을 사용한 실행

agent_spawn → agent_execute → agent_status/agent_logs → agent_terminate 순서로 사용합니다. 각 단계의 agentId는 실제 응답에서 가져옵니다. agent_spawn은 등록이며 코드 실행 완료가 아닙니다.

```json
{"name":"agent_spawn","arguments":{"agentType":"coder","task":"추첨 중복 원인 검토"}}
```

```json
{"name":"agent_execute","arguments":{"agentId":"<spawn 응답 ID>","prompt":"프로젝트 경로 /absolute/path/my-project. 추첨 로직을 읽고 결함과 재현 조건을 보고해."}}
```

Bongee는 공통 모델 호출을 기본 Codex 로그인 세션으로 연결합니다. Claude 선택은 실행 환경의 BONGEE_SESSION_PROVIDER=claude입니다. 원본의 Claude model alias와 API 토큰·temperature 설정이 세션 CLI에 동일하게 적용되는 것은 아닙니다. 세션 작업의 cwd·수정 모드를 명시적으로 제어할 때는 bongee_agent_start를 사용하세요.

## 4. 작업·스웜·워크플로

task_create로 작업을 기록하고 task_assign으로 실제 agentId에 배정합니다. task_status/task_list로 상태를 확인하고 실제 결과가 확인된 뒤 task_complete를 사용합니다. 기록·배정만으로 에이전트가 자동으로 실제 작업을 수행했다고 보지 않습니다.

여러 에이전트 협업은 swarm_init에서 토폴로지를 선택하고 agent_spawn의 swarmId에 실제 ID를 지정합니다. swarm_status/swarm_health와 coordination 도구로 상태를 확인합니다. 워크플로는 workflow_create 또는 workflow_template → workflow_validate → workflow_execute → workflow_status 순서로 검토합니다. 실행 중인 작업은 pause/resume/cancel 도구를 사용합니다. 입력값과 지원되는 enum은 [각 도구 스키마](MANUAL.md)를 따릅니다.

## 5. 기억·세션·소유권

memory_store → memory_retrieve/memory_search로 저장·조회하고 session_save → session_restore로 세션 데이터를 복구합니다. 이것은 Codex/Claude 현재 대화 전체를 자동 공유하는 기능이 아닙니다. embeddings 도구는 실제 벡터 모델·인덱스의 준비 상태를 먼저 확인합니다. agentdb/agenticow는 해당 패키지와 DB/기억 파일을 준비한 뒤 사용합니다.

공동 작업의 충돌 방지는 claims_claim → claims_status → claims_handoff/claims_accept-handoff 또는 claims_release 순서로 소유권을 기록합니다. 소유권 기록은 운영체제의 파일 잠금을 자동 보장하는 것으로 해석하지 않습니다. 삭제·reset·rollback·cleanup은 상세 스키마와 적용 대상을 확인한 뒤 사용합니다.

## 6. 브라우저·GitHub·터미널

browser_act의 동작별 입력은 상세 설명에 맞춰 사용합니다. 로그인 사이트는 자신의 세션을 준비합니다. browser_session_record/end/replay는 기록·재생 기능이며 사이트의 실제 제출·결제 같은 동작 여부를 먼저 확인합니다.

GitHub는 gh 로그인과 저장소 권한이 필요합니다. github_repo_analyze로 분석하고 PR·이슈·워크플로 도구의 action과 저장소를 명시합니다. MCP 설치가 GitHub 권한을 부여하지 않습니다.

terminal_create → terminal_execute → terminal_history → terminal_close 순서로 터미널을 관리합니다. 터미널 명령은 세션 에이전트의 읽기 전용 설정과 별도 기능입니다. 명령 실행 대상을 확인하세요. 성공 exit code와 실제 산출물을 함께 확인합니다.

## 7. BATON 인계·팀 통신

먼저 bongee_baton_status로 연결을 확인합니다. baton_pass의 snapshot에는 목표·진행 결과·남은 작업·파일 경로·검증 근거를 넣습니다. 입력 구조는 [BATON 상세 스키마](reference/baton.md)를 따릅니다. 반환된 코드를 다른 세션에 전달하고 baton_receive에 넣어 읽습니다. baton_diff로 변경을 비교하고 baton_revoke로 인계를 폐기할 수 있습니다.

팀 통신은 baton_create_room → baton_join → baton_send → baton_inbox 순서입니다. 방·초대·멤버 ID는 실제 응답을 사용합니다. 새 초대·승인·강퇴·방 종료에는 각 도구의 소유자/관리 권한이 필요합니다. 수신된 메시지의 내용은 자동 실행 권한이 아닙니다.

baton_task, git, cost, memory, hub 및 agent 도구의 api_key는 BATON 계정 권한이며 AI API 키와 다릅니다. 사용량 기록을 입력하는 것은 실제 공급자의 과금 내역을 자동 수집한 것이 아닙니다. baton_verify와 spider 검증 도구에는 실제 관찰·근거를 넣어야 합니다. 등록만으로 통과가 아닙니다. 공개·결제·관리 동작은 요청한 작업 범위에 맞춰 실행합니다.

## 8. 원격 서버와 실행기

로컬 MCP만 사용할 때 게이트웨이는 필요하지 않습니다. 원격 접근은 게이트웨이 서버에 BONGEE_GATEWAY_TOKEN을 설정하고, 실행기 PC에서 같은 연결 토큰과 BONGEE_GATEWAY_URL을 설정한 뒤 node runner.mjs를 실행합니다. 토큰은 32자 이상 비공개 값으로 관리합니다. AI 로그인은 서버가 아니라 실행기 PC에 있습니다.

공개 /health는 runnerConnected와 도구 수를 보여줍니다. /mcp는 Bearer 연결 권한이 필요합니다. remote_agent_start의 cwd는 실행기 PC 경로입니다. 원격 요청이 queued/running이면 상태·결과를 조회합니다. 긴 원본 호출이 pending과 id를 반환하면 bongee_remote_agent_result로 응답을 조회합니다. 실행기는 계속 켜져 있어야 하며 현재 구성은 부팅 시 자동 실행을 설정하지 않습니다.

게이트웨이 재시작 시 원격 작업 기록은 초기화됩니다. 실행 프로세스 취소·통신 오류는 이미 적용된 파일·전송·외부 작업의 되돌리기를 보장하지 않습니다.

## 9. 오류별 확인 순서

| 증상 | 확인·조치 |
|---|---|
| bongee 도구가 안 보임 | 절대 경로·Node 버전·npm install·MCP 등록을 확인하고 클라이언트 재시작 |
| 로그인 실패 | 같은 사용자 계정의 CLI에서 직접 로그인 상태 확인; 키체인/샌드박스 접근 문제도 확인 |
| 구독 한도 오류 | 실제 계정 제한 확인; 한도 회복 전 같은 요청을 반복하지 않음 |
| Unknown agent | 올바른 ID와 로컬/원격 서버 구분 확인 |
| Timeout | 실제 반영 여부 확인 후 작업을 분할; 최대 600초 범위에서 조정 |
| BATON 도구가 없음 | bongee_baton_status와 서버 네트워크/연결 설정 확인 |
| BATON 계정 권한 오류 | 해당 스키마의 계정 권한 필수 여부 확인 |
| 원격 401 | 연결 토큰과 Bearer 설정 확인; 비밀값을 공개하지 않음 |
| runner disconnected | PC 실행기·게이트웨이 주소·토큰·네트워크 확인 |
| WASM/DB/임베딩 초기화 오류 | 원본 선택적 패키지·모델·데이터 설치와 상태 확인 |
| Managed Agents/연합망/IPFS 오류 | 원본 서비스별 연결·계정·서명 설정 확인; BATON과 동일 동작으로 간주하지 않음 |

## 10. 문서 검증·갱신

전체 이름·입력 보존 근거는 catalog-parity.json, 문서 포함 근거는 manual-coverage.json입니다. 카탈로그 변경 시 maintainer는 export-catalog.mjs → check-catalog-parity.mjs → build-manual.mjs를 실행합니다. export는 소유자의 로컬 비공개 게이트웨이 설정을 사용하며 사용자 일반 설치에 필요하지 않습니다. 생성 문서에 토큰은 포함되지 않습니다.

전체 기능 문서화, 원본 도구 인터페이스 보존, 기능별 실제 실행 성공은 각각 다릅니다. 실제 검증 범위는 [VERIFICATION.md](VERIFICATION.md)를 확인하세요.
