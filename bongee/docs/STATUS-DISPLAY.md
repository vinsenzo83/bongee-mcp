# 세션 하단 에이전트 상태 표시

Bongee의 실제 역할별 실행 상태를 **기획 → 설계·디자인 → 개발 → 검증** 네 단계로 묶어 표시합니다. `bongee_pipeline_start`는 네 단계의 7개 역할을 자동 실행합니다. [자동 개발 설명서](AUTO-PIPELINE.md)에서 시작·수정 반복·중단·재개를 확인하세요. 개별 `bongee_agent_start`도 수동 실행 상태를 표시합니다.

## 표시 예시

```text
bongee | 실행기 연결됨 1개 | 기획:응답 완료 | 설계·디자인:미시작 | 개발:실행 중 | 검증:대기
developer(추첨 구현)#a13bc2[codex] 명령 실행 42초 | tester#9b112e[claude] 분석 중 8초
```

위는 설명용 예시입니다. 실제 화면은 실행 기록을 읽습니다. 역할·공급자·상태·관찰한 활동·경과 시간을 표시하며, 진행률이나 작업 내용을 추정해 만들지 않습니다. 완료는 모델 실행이 정상 응답을 반환했다는 의미이며 제품 검수 통과·전체 개발 완료와 구분합니다.

## Claude Code 하단 표시 설치

연결 설치 스크립트는 이 PC에 `~/.claude`가 있으면 하단 표시도 함께 설정합니다. 기존 Git/BATON/사용량 표시와 최초 백업은 버전 업그레이드 때도 보존합니다. 소스만 `npm install`한 경우에는 아래 명령으로 별도 설정합니다. 이 동작은 Claude Code용이며 Codex 앱이나 CLI 기본 하단을 변경하지 않습니다.

`실행기 연결됨`은 같은 OS 사용자의 실행기가 최근 15초 이내 서버의 인증된 heartbeat 응답을 받았고 해당 프로세스가 살아 있다는 뜻입니다. 현재 채팅의 MCP 초기화 성공, 다른 AI 세션의 연결, 작업 검수 성공을 대신하지 않습니다. 오래되거나 종료된 실행기는 `실행기 연결 끊김`, 아직 기록이 없는 구버전 실행기는 `연결 확인 전`으로 표시합니다. 단계와 작업은 현재 프로젝트 경로에 해당하는 로컬·원격 설치 프로필 기록을 함께 읽습니다.

```sh
cd /absolute/path/bongee-mcp/bongee
npm install
npm run statusline:install
```

Claude Code 사용자 설정의 statusLine에 로컬 스크립트를 연결합니다. 기존 Git/BATON/사용량 상태줄 명령은 먼저 실행하고 Bongee 표시를 덧붙입니다. 기존 설정을 비공개 백업에 보관하며 다른 설정은 유지합니다. 설치를 반복해도 Bongee 명령을 중첩하지 않습니다. statusLine의 refreshInterval은 2초로 설정합니다. 실제 갱신은 클라이언트 버전·신뢰/관리 설정·렌더링 시점에 따라 달라집니다.

설치 후 Claude Code를 다시 열거나 설정 갱신을 확인하세요. 표시가 안 나오면 현재 버전의 사용자 정의 상태줄 지원, workspace trust, disableAllHooks, 관리형 정책을 확인합니다. 구독 모델 호출은 표시 자체에 필요하지 않습니다. npm install만으로 다른 사용자의 전역 상태줄을 자동 변경하지 않으며 statusline:install을 별도로 실행합니다.

설정 확인: ~/.claude/settings.json의 statusLine. 백업: ~/.claude/bongee-statusline-backup.json. 이전 명령: ~/.claude/bongee-statusline-previous.json. 비밀이 포함될 수 있으므로 이 파일을 공개하지 않습니다. 표시 설치는 MCP 등록을 대신하지 않습니다.

복구:

```sh
npm run statusline:uninstall
```

기존 상태줄만 복구하며 설치 이후 바뀐 다른 설정은 유지합니다. 다른 프로그램이 상태줄을 교체했으면 임의로 덮어쓰지 않고 중단합니다. ZIP 설치 폴더를 옮겼다면 새 경로에서 기존 설정을 복구한 뒤 다시 설치하세요.

공식 설정: [Claude Code status line](https://code.claude.com/docs/en/statusline).

## Codex에서 표시

현재 확인한 공식 Codex 설정은 tui.status_line에 내장 상태 항목 ID를 지정하는 방식입니다. 외부 MCP의 임의 상태줄 명령을 넣는 공식 설정은 확인되지 않았습니다. Codex 앱/CLI의 하단 UI를 MCP 서버가 직접 수정하지 않습니다.

Codex와 함께 별도 터미널 또는 분할 터미널의 하단 영역에서 다음 모니터를 실행합니다.

```sh
cd /absolute/path/bongee-mcp/bongee
node monitor.mjs --watch --cwd /absolute/path/my-project
```

터미널 화면을 1초마다 갱신하며 4단계 요약과 최대 20개의 역할·이름·공급자·상태·시간·ID를 표시합니다. Ctrl+C로 종료합니다. 현재 프로젝트의 기록만 표시하므로 --cwd에 에이전트가 작업하는 정확한 폴더를 넣습니다. 읽기만 하며 에이전트를 실행·중단하거나 상태를 바꾸지 않습니다.

```sh
node monitor.mjs --cwd /absolute/path/my-project
node monitor.mjs --json --cwd /absolute/path/my-project
node monitor.mjs --all
```

첫 명령은 한 번 조회, 두 번째는 JSON 출력, --all은 모든 로컬 세션 작업 기록 조회입니다. --all은 PC 전체의 모든 프로젝트 원본 Ruflo 등록 파일을 탐색하지 않습니다.

공식 설정: [Codex configuration reference](https://developers.openai.com/codex/config-reference/).

## 역할과 단계 지정

```json
{
  "name": "bongee_agent_start",
  "arguments": {
    "provider": "codex",
    "cwd": "/absolute/path/my-project",
    "role": "planner",
    "name": "럭키드로우 기획",
    "phase": "planning",
    "mode": "read-only",
    "timeoutSeconds": 300,
    "prompt": "추첨 서비스의 요구사항·화면 흐름·완료 조건을 정리해."
  }
}
```

role/name은 각각 최대 80자이고 제어 문자는 거부합니다. 역할은 실행 프롬프트에도 전달됩니다. 표시 이름에는 비밀·개인정보를 넣지 않습니다. phase를 생략하면 알려진 역할명에서 분류하고, 알 수 없는 역할은 미분류로 남깁니다. 역할을 생략한 기존 작업도 목록에는 표시되지만 네 단계에 임의 배정하지 않습니다.

| phase | 단계 | 대표 역할 |
|---|---|---|
| planning | 기획 | planner, researcher, 기획자, 조사자 |
| design | 설계·디자인 | architect, designer, 설계자, 디자이너 |
| development | 개발 | coder, developer, engineer, 개발자 |
| verification | 검증 | tester, reviewer, auditor, 테스터, 리뷰어 |

원본 agent_spawn/agent_execute도 감시합니다. agentType으로 역할을 구분하고 실제 agent_execute 호출 시작·정상 응답·실패를 별도 관찰 기록으로 저장합니다. 원본 도구 이름·입력 스키마는 변경하지 않습니다. 단순 등록 상태만 있는 busy는 실제 실행으로 단정하지 않습니다.

## 상태의 의미

| 표시 | 근거 |
|---|---|
| 미시작 | 이 범위에 해당 단계 기록 없음 |
| 대기 | 원본 에이전트가 idle로 등록됨 |
| 실행 중 | 실제 세션 실행 또는 Bongee를 통한 원본 실행 관찰이 진행 중 |
| 응답 완료 | 해당 실행의 정상 완료 응답 확인; 품질·검수 통과를 뜻하지 않음 |
| 실패 | 정상 완료 응답 없이 실패 |
| 시간 초과 | 설정한 실행 제한시간 도달 |
| 중단됨 | 기록의 소유 실행 프로세스가 사라짐 |
| 취소 | 실제 작업 취소 기록 |
| 등록:busy | 원본 등록 정보만 busy; Bongee의 실제 실행 관찰 없음 |
| 종료 | 원본 등록 에이전트 종료 |

같은 단계에 실행 중인 역할이 있으면 실행 중을 우선 표시하고, 없으면 시작 시각이 가장 최근인 기록을 대표 상태로 표시합니다. 이전 실행의 기록도 포함될 수 있으므로 단계 요약을 새 프로젝트 전체 진행률로 해석하지 않습니다. 세션당/프로세스당 실행 제한을 늘리는 기능은 아니며 기존 실행 프로세스당 동시 2개 제한은 유지합니다.

## MCP로 상태 확인

```json
{"name":"bongee_monitor_status","arguments":{"cwd":"/absolute/path/my-project"}}
```

4단계 요약, 역할별 상태, 경과 시간, 실제 실행 수를 읽습니다. cwd를 생략하면 MCP의 작업 폴더를 사용합니다. 원격 호출도 같은 도구를 전달하므로 cwd는 로컬 실행기 PC의 경로입니다. remote_agent_start에도 role/name/phase를 지정할 수 있습니다. 원격 큐의 queued 상태는 remote_agent_status/list에서 확인하며 로컬 모니터에는 로컬 실행이 시작된 뒤 나타납니다.

## 기록·관찰 범위

세션 작업은 ~/.session-agents-mcp/*.json, 원본 실행 관찰은 하위 observations 폴더에 저장합니다. 모니터는 프롬프트·코드·원본 출력·연결 토큰을 화면에 내보내지 않습니다. 원본 등록 상태는 대상 프로젝트의 .claude-flow/agents/store.json과 agents.json을 읽습니다. 진행 중 활동은 세션 stdout 이벤트에서 명령 실행/파일 변경/응답 작성 등의 유형만 추출해 약 1초 간격으로 저장합니다. 원본 agent_execute에는 시작·종료 관찰만 있고 내부 작업별 상세 활동은 제공되지 않습니다.

Bongee를 통하지 않은 별도 프로세스, 다른 PC, 모든 Codex 네이티브 서브에이전트가 자동 관찰되는 기능은 아닙니다. 원본 등록 정보에는 실행 시각이 없을 수 있어 경과 시간은 —로 표시합니다. 프로세스 종료 후 관찰 기록은 중단됨으로 읽되 모니터가 저장 상태를 덮어쓰지는 않습니다.
