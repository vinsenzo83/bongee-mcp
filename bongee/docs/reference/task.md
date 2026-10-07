# 작업 생성·배정·진행

[전체 목차](../MANUAL.md) · [사용 순서](../WORKFLOWS.md)

- [task_create](#task_create)
- [task_status](#task_status)
- [task_list](#task_list)
- [task_complete](#task_complete)
- [task_update](#task_update)
- [task_assign](#task_assign)
- [task_cancel](#task_cancel)
- [task_retry](#task_retry)
- [task_summary](#task_summary)

## task_create

출처: Ruflo 원본

### 기능과 사용 시점

Create a new task Use when native TodoWrite is wrong because you need cross-session task persistence, agent assignment, dependency tracking, or completion analytics in the .swarm/memory.db. For in-session checklists native TodoWrite is simpler and faster.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| type | string | 예 | Task type (feature, bugfix, research, refactor) | — |
| description | string | 예 | Task description | — |
| priority | string | 아니오 | Task priority (low, normal, high, critical) | — |
| assignTo | array | 아니오 | Agent IDs to assign | — |
| tags | array | 아니오 | Task tags | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "type": {
      "type": "string",
      "description": "Task type (feature, bugfix, research, refactor)"
    },
    "description": {
      "type": "string",
      "description": "Task description"
    },
    "priority": {
      "type": "string",
      "description": "Task priority (low, normal, high, critical)"
    },
    "assignTo": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Agent IDs to assign"
    },
    "tags": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Task tags"
    }
  },
  "required": [
    "type",
    "description"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "task_create",
  "arguments": {
    "type": "<type 입력>",
    "description": "<description 입력>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## task_status

출처: Ruflo 원본

### 기능과 사용 시점

Get task status Use when native TodoWrite is wrong because you need cross-session task persistence, agent assignment, dependency tracking, or completion analytics in the .swarm/memory.db. For in-session checklists native TodoWrite is simpler and faster.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| taskId | string | 예 | Task ID | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "taskId": {
      "type": "string",
      "description": "Task ID"
    }
  },
  "required": [
    "taskId"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "task_status",
  "arguments": {
    "taskId": "<앞 단계에서 받은 ID>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## task_list

출처: Ruflo 원본

### 기능과 사용 시점

List all tasks Use when native TodoWrite is wrong because you need cross-session task persistence, agent assignment, dependency tracking, or completion analytics in the .swarm/memory.db. For in-session checklists native TodoWrite is simpler and faster.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| status | string | 아니오 | Filter by status | — |
| type | string | 아니오 | Filter by type | — |
| assignedTo | string | 아니오 | Filter by assigned agent | — |
| priority | string | 아니오 | Filter by priority | — |
| limit | number | 아니오 | Max tasks to return | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "status": {
      "type": "string",
      "description": "Filter by status"
    },
    "type": {
      "type": "string",
      "description": "Filter by type"
    },
    "assignedTo": {
      "type": "string",
      "description": "Filter by assigned agent"
    },
    "priority": {
      "type": "string",
      "description": "Filter by priority"
    },
    "limit": {
      "type": "number",
      "description": "Max tasks to return"
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "task_list",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## task_complete

출처: Ruflo 원본

### 기능과 사용 시점

Mark task as complete Use when native TodoWrite is wrong because you need cross-session task persistence, agent assignment, dependency tracking, or completion analytics in the .swarm/memory.db. For in-session checklists native TodoWrite is simpler and faster.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| taskId | string | 예 | Task ID | — |
| result | object | 아니오 | Task result data | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "taskId": {
      "type": "string",
      "description": "Task ID"
    },
    "result": {
      "type": "object",
      "description": "Task result data"
    }
  },
  "required": [
    "taskId"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "task_complete",
  "arguments": {
    "taskId": "<앞 단계에서 받은 ID>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## task_update

출처: Ruflo 원본

### 기능과 사용 시점

Update task status or progress Use when native TodoWrite is wrong because you need cross-session task persistence, agent assignment, dependency tracking, or completion analytics in the .swarm/memory.db. For in-session checklists native TodoWrite is simpler and faster.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| taskId | string | 예 | Task ID | — |
| status | string | 아니오 | New status | — |
| progress | number | 아니오 | Progress percentage (0-100) | — |
| assignTo | array | 아니오 | Agent IDs to assign | — |
| result | object | 아니오 | Result data (e.g. the failure of a failed task) | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "taskId": {
      "type": "string",
      "description": "Task ID"
    },
    "status": {
      "type": "string",
      "description": "New status"
    },
    "progress": {
      "type": "number",
      "description": "Progress percentage (0-100)"
    },
    "assignTo": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Agent IDs to assign"
    },
    "result": {
      "type": "object",
      "description": "Result data (e.g. the failure of a failed task)"
    }
  },
  "required": [
    "taskId"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "task_update",
  "arguments": {
    "taskId": "<앞 단계에서 받은 ID>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## task_assign

출처: Ruflo 원본

### 기능과 사용 시점

Assign a task to one or more agents Use when native TodoWrite is wrong because you need cross-session task persistence, agent assignment, dependency tracking, or completion analytics in the .swarm/memory.db. For in-session checklists native TodoWrite is simpler and faster.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| taskId | string | 예 | Task ID to assign | — |
| agentIds | array | 아니오 | Agent IDs to assign | — |
| unassign | boolean | 아니오 | Unassign all agents from task | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "taskId": {
      "type": "string",
      "description": "Task ID to assign"
    },
    "agentIds": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Agent IDs to assign"
    },
    "unassign": {
      "type": "boolean",
      "description": "Unassign all agents from task"
    }
  },
  "required": [
    "taskId"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "task_assign",
  "arguments": {
    "taskId": "<앞 단계에서 받은 ID>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## task_cancel

출처: Ruflo 원본

### 기능과 사용 시점

Cancel a task Use when native TodoWrite is wrong because you need cross-session task persistence, agent assignment, dependency tracking, or completion analytics in the .swarm/memory.db. For in-session checklists native TodoWrite is simpler and faster.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| taskId | string | 예 | Task ID | — |
| reason | string | 아니오 | Cancellation reason | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "taskId": {
      "type": "string",
      "description": "Task ID"
    },
    "reason": {
      "type": "string",
      "description": "Cancellation reason"
    }
  },
  "required": [
    "taskId"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "task_cancel",
  "arguments": {
    "taskId": "<앞 단계에서 받은 ID>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## task_retry

출처: Ruflo 원본

### 기능과 사용 시점

Re-queue a failed/cancelled/completed task by cloning its spec into a fresh pending task (the original record is kept as history). Use when native TodoWrite is wrong because you need the original task's persisted spec (type, priority, assignees, tags) and a stable taskId chain across runs rather than hand-retyping a checklist item. For ad-hoc re-runs, native TodoWrite is fine.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| taskId | string | 예 | ID of the task to retry | — |
| resetState | boolean | 아니오 | Reset progress/result on the new task (default true) | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "taskId": {
      "type": "string",
      "description": "ID of the task to retry"
    },
    "resetState": {
      "type": "boolean",
      "description": "Reset progress/result on the new task (default true)"
    }
  },
  "required": [
    "taskId"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "task_retry",
  "arguments": {
    "taskId": "<앞 단계에서 받은 ID>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## task_summary

출처: Ruflo 원본

### 기능과 사용 시점

Get a summary of all tasks by status Use when native TodoWrite is wrong because you need cross-session task persistence, agent assignment, dependency tracking, or completion analytics in the .swarm/memory.db. For in-session checklists native TodoWrite is simpler and faster.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| 없음 | — | — | 이름 있는 입력 필드 없음; 아래 스키마 확인 | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {}
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "task_summary",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.
