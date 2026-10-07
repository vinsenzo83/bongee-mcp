# 실제 자동 개발 실행

`bongee_pipeline_start` 한 번으로 4단계의 7개 역할을 순서대로 실제 실행합니다. 각 역할은 기존 로그인으로 별도 Codex/Claude CLI 세션을 실행하며, 앞 역할의 검증된 JSON 산출물과 실제 테스트 결과를 다음 역할에 전달합니다.

| 단계 | 실제 역할 | 산출물과 동작 |
|---|---|---|
| 기획 | planner, researcher | 요구사항 ID·검증 방법, 실제 저장소 조사·제약 |
| 설계·디자인 | architect, designer | 구현 파일 계획, UI/UX 명세 또는 UI가 필요 없는 이유 |
| 개발 | developer | 대상 폴더의 실제 파일 구현·수정 |
| 검증 | 실제 명령 실행, tester, reviewer | 종료 코드·출력·소스 지문, 요구사항별 판정, 독립 코드 검토 |

검증 실패는 developer로 돌아가 수정하고 명령·tester·reviewer를 다시 실행합니다. 최초 실행 외 수정 반복은 기본 3회, 최대 20회입니다. 한도를 넘기면 실패로 종료하며 완료로 표시하지 않습니다. 역할은 순차 실행하므로 한 파이프라인에서 7개가 동시에 돌아가지는 않습니다. 서로 다른 프로젝트의 실행은 프로세스의 에이전트 동시 실행 제한을 공유합니다.

## 시작

먼저 해당 PC에 Node.js 20 이상, 사용할 Codex/Claude CLI와 구독 로그인을 준비하고 Bongee를 설치합니다. API 키는 이 실행에 필요하지 않습니다. 빈 프로젝트도 폴더를 먼저 만들고 절대 경로를 지정하세요. 원격 MCP를 사용할 때 cwd는 연결된 로컬 실행기 PC의 경로입니다.

```json
{
  "name": "bongee_pipeline_start",
  "arguments": {
    "cwd": "/absolute/path/my-service",
    "request": "봉이 추첨 서비스 구현. 참가자 검증, 무작위 당첨자 1명, 빈 참가자 오류, 사용 설명서와 실제 테스트를 포함해 완성하세요.",
    "provider": "codex",
    "maxRepairRounds": 3,
    "stageTimeoutSeconds": 600,
    "checkTimeoutSeconds": 300
  }
}
```

시작은 ID를 즉시 반환합니다. 실행 완료를 기다린 응답이 아닙니다. 반환된 ID로 `bongee_pipeline_status`를 조회하고, 종료 후 `bongee_pipeline_result`에서 산출물·검증 근거·실패 사유를 확인하세요. 원격 큐의 도구 요청 completed도 이 시작 호출이 끝났다는 의미이며 파이프라인 완료는 별도로 확인합니다.

## 검증 명령과 완료 조건

checks를 생략하면 프로젝트 파일을 확인해 npm build/typecheck/check/lint/test, pytest, cargo test, go test, dotnet test, Maven·Gradle 테스트를 발견합니다. watch·명백한 빈 테스트는 제외합니다. 알려진 별칭은 중복 실행을 줄입니다. 프로젝트가 지원하지 않는 명령이나 필요한 도구가 없으면 실제 실패로 기록됩니다.

직접 지정할 때 최대 32개 명령을 argv로 전달합니다. 셸 문자열을 해석하지 않습니다.

```json
{"checks":[{"id":"acceptance","command":"node","args":["--test"]}]}
```

빈 checks는 자동 발견을 끄며 완료를 허용하지 않습니다. 명령이 모두 성공하고 검사 중 소스가 바뀌지 않으며, tester가 모든 기획 요구사항을 빠짐없이 통과 판정하고 reviewer가 미해결 문제 없이 통과해야 completed가 됩니다. 검토 이후에도 소스 지문을 다시 비교합니다. 각 판정과 로그는 근거이며 전체 Ruflo 기능이나 임의 제품의 완전성을 보증하는 지표가 아닙니다. 테스트 내용을 충분하게 작성하는 것도 요청과 리뷰의 대상입니다.

## 공급자 선택·제어·복구

provider 기본값은 codex입니다. providers 객체의 planner/researcher/architect/designer/developer/tester/reviewer에 각각 codex 또는 claude를 지정할 수 있습니다. 선택한 공급자가 로그인되지 않았거나 한도를 소진하면 실제 실패로 기록합니다. 임의로 다른 공급자로 바꾸지 않습니다. 원하는 공급자로 `bongee_pipeline_resume`을 호출할 수 있습니다.

| 도구 | 사용 |
|---|---|
| bongee_pipeline_list | 모든 실행 조회, cwd로 프로젝트 제한 |
| bongee_pipeline_pause | 현재 역할·명령을 멈추고 상태 보존 |
| bongee_pipeline_resume | id로 재개, provider/providers/checks/maxRepairRounds 변경 가능 |
| bongee_pipeline_cancel | 실행 취소, 자동 파일 되돌리기는 하지 않음 |
| bongee_monitor_status | 네 단계·실제 역할 상태·수정 회차 조회 |

작업 기록은 사용자 홈의 `.session-agents-mcp/pipelines`에 접근 제한된 파일로 보존합니다. 원격 서버가 아닌 로컬 실행기가 실제 에이전트를 실행합니다. 실행기가 꺼지면 진행할 수 없고 종료된 소유자의 작업은 interrupted로 읽습니다. 재개는 확인된 산출물을 보존하고 불확실한 역할을 다시 실행하며 검증을 다시 수행합니다. 완료·취소된 실행은 재개할 수 없으며 새 요청으로 시작합니다. 동일·상하위 폴더의 살아 있는 파이프라인 실행은 차단합니다.

각 역할 제한 시간 최대 600초, 명령 제한 시간 최대 600초입니다. 출력·산출물·인계 맥락에는 크기 한도가 있으며 초과하면 조용히 생략하지 않고 실패 사유를 기록합니다. 산출물 원문과 요청은 개인 실행 기록이므로 공개 ZIP에 포함하지 않습니다.

## 하단 표시

[상태줄 설치](STATUS-DISPLAY.md)를 따르면 자동 실행 ID·상태·수정 회차와 기획/설계·디자인/개발/검증을 표시합니다. `응답 완료`는 개별 역할의 응답이고 자동 실행의 `검증 완료`와 구분됩니다. 읽기만 하는 모니터 자체는 모델을 호출하지 않습니다.

## 검증 근거와 큰 결과 조회

검증 로그와 역할 산출물은 각 회차의 변경하지 않는 파일로 보존하고 최신 결과와 구분합니다. `bongee_pipeline_result`의 이력은 historyOffset=0, historyLimit=3이 기본값입니다. pagination의 total과 nextOffset으로 다음 페이지를 읽고, includeCurrent=false로 최신 산출물을 다시 받지 않고 이력만 조회할 수 있습니다. 전체 이력은 보존되며 페이지 밖의 항목도 검증에서 생략되지 않습니다.

프로세스 감시는 OS의 ps 조회 권한이 필요합니다. 조회가 차단된 환경에서는 실행 실패로 기록합니다.

원격 응답은 최대 8 MB입니다. 큰 결과는 historyLimit=1, includeCurrent=false로 페이지를 조회하세요. 큰 인계 맥락은 기록된 한도에 따라 실패를 명시합니다.
