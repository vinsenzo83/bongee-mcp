# 미션 계획·행동 요청

[전체 목차](../MANUAL.md) · [사용 순서](../WORKFLOWS.md)

- [mission_create](#mission_create)
- [mission_plan](#mission_plan)
- [mission_get](#mission_get)
- [mission_events](#mission_events)
- [mission_request_action](#mission_request_action)

## mission_create

출처: Ruflo 원본

### 기능과 사용 시점

Create a draft mission (objective only), idempotent per requestId. Use when starting governed multi-step work that several clients (CLI, MCP, the Claude Code workbench) must observe and control through one durable record. task_create is wrong because a task has no plan revision, budget ceiling or acceptance evidence. Recording a mission executes nothing.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| requestId | string | 예 | Caller-chosen idempotency key; reuse only to retry the same request | {"maxLength":128} |
| objective | string | 예 | — | {"maxLength":2000} |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "requestId": {
      "type": "string",
      "maxLength": 128,
      "description": "Caller-chosen idempotency key; reuse only to retry the same request"
    },
    "objective": {
      "type": "string",
      "maxLength": 2000
    }
  },
  "required": [
    "requestId",
    "objective"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "mission_create",
  "arguments": {
    "requestId": "<앞 단계에서 받은 ID>",
    "objective": "<objective 입력>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## mission_plan

출처: Ruflo 원본

### 기능과 사용 시점

Submit or revise a mission plan: acyclic task graph, acceptance criteria and budget ceiling in integer minor units. Use when a mission needs a reviewable plan before any authorization or admission. Editing plan state through memory_store is wrong because it bypasses revision checks: a stale expectedRevision here returns a conflict with the current revision, and a revision invalidates prior authorization.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| requestId | string | 예 | Caller-chosen idempotency key; reuse only to retry the same request | {"maxLength":128} |
| missionId | string | 예 | Mission id | {"pattern":"^msn_[a-f0-9]{24}$"} |
| expectedRevision | integer | 예 | Mission revision the request was prepared against | {"minimum":1} |
| plan | object | 예 | { tasks[], acceptance[], budget{currency, ceilingMinor}, scope } | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "requestId": {
      "type": "string",
      "maxLength": 128,
      "description": "Caller-chosen idempotency key; reuse only to retry the same request"
    },
    "missionId": {
      "type": "string",
      "pattern": "^msn_[a-f0-9]{24}$",
      "description": "Mission id"
    },
    "expectedRevision": {
      "type": "integer",
      "minimum": 1,
      "description": "Mission revision the request was prepared against"
    },
    "plan": {
      "type": "object",
      "description": "{ tasks[], acceptance[], budget{currency, ceilingMinor}, scope }"
    }
  },
  "required": [
    "requestId",
    "missionId",
    "expectedRevision",
    "plan"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "mission_plan",
  "arguments": {
    "requestId": "<앞 단계에서 받은 ID>",
    "missionId": "<앞 단계에서 받은 ID>",
    "expectedRevision": 1,
    "plan": {}
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## mission_get

출처: Ruflo 원본

### 기능과 사용 시점

Read one mission (record, plan, budget, tasks, evidence, executor observation) or list missions; read only. Use when you need the authoritative current state of a mission before acting on it. Inferring state from task_status or a UI badge is wrong because task status is recorded state; only evidence.verified counts as verified, and a disconnected executor is not a failure.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| missionId | string | 아니오 | Mission id | {"pattern":"^msn_[a-f0-9]{24}$"} |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "missionId": {
      "type": "string",
      "pattern": "^msn_[a-f0-9]{24}$",
      "description": "Mission id"
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "mission_get",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## mission_events

출처: Ruflo 원본

### 기능과 사용 시점

Read mission events after a durable cursor (afterSequence). Use when resuming or reconnecting a client and you need exactly what changed since your last sequence. Re-reading mission_get in a loop is wrong because it loses the transition history; delivery here may repeat, so deduplicate by (missionId, seq), and gap=true means reload with mission_get before replaying.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| missionId | string | 예 | Mission id | {"pattern":"^msn_[a-f0-9]{24}$"} |
| afterSequence | integer | 아니오 | — | {"minimum":0} |
| limit | integer | 아니오 | — | {"minimum":1,"maximum":500} |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "missionId": {
      "type": "string",
      "pattern": "^msn_[a-f0-9]{24}$",
      "description": "Mission id"
    },
    "afterSequence": {
      "type": "integer",
      "minimum": 0
    },
    "limit": {
      "type": "integer",
      "minimum": 1,
      "maximum": 500
    }
  },
  "required": [
    "missionId"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "mission_events",
  "arguments": {
    "missionId": "<앞 단계에서 받은 ID>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## mission_request_action

출처: Ruflo 원본

### 기능과 사용 시점

Request a scoped mission control action: requestAuthorization, pause or cancel (admit and resume report executor-unavailable until a durable executor is admitted). Use when a person or agent wants a running or planned mission to change course. Calling task_cancel or killing a process is wrong because it skips the revision check and executor acknowledgement; a request is not authorization, the runtime decides.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| requestId | string | 예 | Caller-chosen idempotency key; reuse only to retry the same request | {"maxLength":128} |
| missionId | string | 예 | Mission id | {"pattern":"^msn_[a-f0-9]{24}$"} |
| expectedRevision | integer | 예 | Mission revision the request was prepared against | {"minimum":1} |
| action | string | 예 | — | {"enum":["requestAuthorization","pause","cancel","admit","resume"]} |
| reason | string | 아니오 | — | {"maxLength":500} |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "requestId": {
      "type": "string",
      "maxLength": 128,
      "description": "Caller-chosen idempotency key; reuse only to retry the same request"
    },
    "missionId": {
      "type": "string",
      "pattern": "^msn_[a-f0-9]{24}$",
      "description": "Mission id"
    },
    "expectedRevision": {
      "type": "integer",
      "minimum": 1,
      "description": "Mission revision the request was prepared against"
    },
    "action": {
      "type": "string",
      "enum": [
        "requestAuthorization",
        "pause",
        "cancel",
        "admit",
        "resume"
      ]
    },
    "reason": {
      "type": "string",
      "maxLength": 500
    }
  },
  "required": [
    "requestId",
    "missionId",
    "expectedRevision",
    "action"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "mission_request_action",
  "arguments": {
    "requestId": "<앞 단계에서 받은 ID>",
    "missionId": "<앞 단계에서 받은 ID>",
    "expectedRevision": 1,
    "action": "requestAuthorization"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.
