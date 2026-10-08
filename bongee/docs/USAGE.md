# bongee 사용 설명서

설치·등록은 [README](../README.md)를 따릅니다. [전체 도구 상세 매뉴얼](MANUAL.md)과 [작업별 실행 순서](WORKFLOWS.md)도 함께 제공됩니다. 등록 후 Codex 또는 Claude를 재시작하거나 새 대화를 열고 `bongee 연결 상태와 로그인 상태를 확인해`라고 요청합니다. 모델 실행에는 해당 CLI의 기존 로그인이 필요합니다.

## 세션 실행 도구 전체

한 번에 자동 개발하려면 [4단계 자동 실행 설명서](AUTO-PIPELINE.md)의 bongee_pipeline_start를 사용합니다.

기획자·개발자·테스터·리뷰어 역할과 4단계 상태줄 설치는 [하단 상태 표시 설명서](STATUS-DISPLAY.md)를 따릅니다. `bongee_agent_start`에 선택 입력 role/name/phase를 지정할 수 있으며, `bongee_monitor_status`에 프로젝트 cwd를 넣으면 실제 역할별 상태를 조회합니다.

| 도구 | 기능 | 입력 |
|---|---|---|
| bongee_provider_status | Codex·Claude 로그인 확인 | 없음 |
| bongee_agent_start | 새 CLI 에이전트 실행 | provider, cwd, prompt 필수; mode, timeoutSeconds 선택 |
| bongee_agent_status | 실행 상태 확인 | id |
| bongee_agent_result | 최종 응답·세션 ID 확인 | id |
| bongee_agent_cancel | 실행 프로세스 중단 | id |
| bongee_agent_list | 작업 목록 조회 | 없음 |
| bongee_baton_status | BATON 연결·도구 노출 상태 | 없음 |
| bongee_monitor_status | 4단계·역할별 실제 실행 상태 | cwd 선택 |

provider는 `codex` 또는 `claude`, cwd는 프로젝트 절대 경로입니다. mode는 기본 `read-only`, 파일 수정 시 `workspace-write`를 명시합니다. timeoutSeconds는 기본 180초, 최대 600초입니다. 프로세스당 동시 실행은 2개입니다. 새 에이전트는 현재 대화를 자동으로 전달받지 않습니다. 목표·제약·프로젝트 경로를 prompt에 넣으세요.

```json
{
  "provider": "codex",
  "cwd": "/absolute/path/my-project",
  "prompt": "추첨 동작을 검토하고 오류를 수정한 뒤 관련 테스트를 실행해. 수정 파일과 테스트 결과를 보고해.",
  "mode": "workspace-write",
  "timeoutSeconds": 300
}
```

start가 반환한 id로 status/result를 조회합니다. 작업 시작은 완료가 아닙니다. 실패하면 결과의 원인을 확인합니다. 로그인 오류는 해당 CLI에서 다시 로그인하고, 구독 한도 오류는 계정 한도가 회복돼야 합니다. cancel은 이미 저장한 파일이나 외부 변경을 되돌리지 않습니다.

자연어 요청 예시:

- `bongee로 /absolute/path/my-project를 읽기 전용으로 검토하고 결함을 보고해.`
- `bongee로 Codex 에이전트를 실행해. /absolute/path/my-project의 오류를 수정하고 테스트해. 파일 수정 허용.`
- `bongee 작업 목록과 실행 중인 작업 결과를 확인해.`
- `bongee 작업 ID …를 중단해.`
- `BATON 연결을 확인한 뒤 인계할 내용을 정리해.`

## 원본 Ruflo 기능

원본 도구 358개는 그대로 전달합니다. 에이전트·작업 관리, 협업, 메모리·검색, 신경망·임베딩, 브라우저, GitHub 및 외부 연동 등의 개별 설명과 모든 입력은 [상세 매뉴얼](MANUAL.md)에 있습니다. `사용 가능한 도구에서 … 기능을 찾아 입력 조건과 연결 요구사항을 설명해`라고 요청할 수 있습니다. 원본 문서는 저장소의 상위 README와 docs에도 보존되어 있습니다. 전체 기능 문서화는 전체 실행 검증과 구분합니다.

기존 agent_spawn/agent_execute 경로의 공통 모델 호출도 로그인 세션으로 실행합니다. 기본 공급자는 Codex이며 `BONGEE_SESSION_PROVIDER=claude`로 바꿉니다. 외부 서비스 전용 기능에는 별도 연결·권한이 남아 있습니다.

## BATON

연결 성공 시 실제 BATON 도구 45개가 노출됩니다. 해당 도구의 설명·입력 스키마에 따라 암호화 인계, 수신, 차이 확인, 검증, 팀 방을 사용합니다. 일부 계정 관리에는 BATON 계정 권한이 필요합니다. 연결 확인만으로 인계가 전송되지는 않습니다. [대체 범위와 제약](BATON-INTEGRATION.md)을 확인하세요.

## 원격 실행

[주소 설치 안내](URL-INSTALL.md)를 따라 MCP 주소를 등록하고 브라우저 연결을 허용합니다. 토큰 복사 없이 자동 인증됩니다. 새 사용자는 연결한 Codex·Claude Code 세션에 “Bongee 자동 준비 후 작업해”라고 요청합니다. 세션이 `bongee_auto_setup`으로 준비 명령을 받아 자신의 터미널에서 실행하고 실행기 응답을 확인합니다. 수동 ZIP 다운로드는 기본 설치 단계에 없습니다. Node.js 20 이상과 호스트 터미널 사용이 필요하며 앱의 실행 승인 정책을 따릅니다. 로컬 runner가 켜져 있어야 실제 작업을 실행할 수 있습니다. 사용자별 작업과 실행기는 분리됩니다.

원격 전용 도구는 `bongee_remote_provider_status`, `bongee_remote_agent_start`, `bongee_remote_agent_status`, `bongee_remote_agent_result`, `bongee_remote_agent_cancel`, `bongee_remote_agent_list` 6개와 자동 준비 도구 `bongee_auto_setup`입니다. start의 입력은 위 세션 실행과 같으며 cwd는 실행기 PC의 경로입니다. 상태·결과·중단에는 반환된 id를 사용합니다. 긴 원본 호출이 대기 ID를 반환하면 remote_agent_result로 확인합니다. 서버 재시작 시 원격 작업 기록은 초기화됩니다.

## 검증 명령

```sh
npm test
node check-local.mjs
node check-local.mjs --execute
node check-local.mjs --claude
```

마지막 두 명령은 실제 계정 사용량을 소비하는 모델 실행입니다. 연결 및 제한 사항의 검증 범위는 [VERIFICATION.md](VERIFICATION.md)에 기록되어 있습니다.
