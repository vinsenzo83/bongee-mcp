# 작업 소유권·인계

[전체 목차](../MANUAL.md) · [사용 순서](../WORKFLOWS.md)

- [claims_claim](#claims_claim)
- [claims_release](#claims_release)
- [claims_handoff](#claims_handoff)
- [claims_accept-handoff](#claims_accept-handoff)
- [claims_status](#claims_status)
- [claims_list](#claims_list)
- [claims_mark-stealable](#claims_mark-stealable)
- [claims_steal](#claims_steal)
- [claims_stealable](#claims_stealable)
- [claims_load](#claims_load)
- [claims_board](#claims_board)
- [claims_rebalance](#claims_rebalance)

## claims_claim

출처: Ruflo 원본

### 기능과 사용 시점

Claim an issue for work (human or agent) Use when nothing native covers per-agent capability gating — Claude Code agents have file-system access by default. Pair claims_grant + claims_check before letting an agent run privileged ops. For trusted in-session work, no claims call is needed.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| issueId | string | 예 | Issue ID or GitHub issue number | — |
| claimant | string | 예 | Claimant identifier (e.g., "human:user-1:Alice" or "agent:coder-1:coder") | — |
| context | string | 아니오 | Optional context about the work approach | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "issueId": {
      "type": "string",
      "description": "Issue ID or GitHub issue number"
    },
    "claimant": {
      "type": "string",
      "description": "Claimant identifier (e.g., \"human:user-1:Alice\" or \"agent:coder-1:coder\")"
    },
    "context": {
      "type": "string",
      "description": "Optional context about the work approach"
    }
  },
  "required": [
    "issueId",
    "claimant"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "claims_claim",
  "arguments": {
    "issueId": "<앞 단계에서 받은 ID>",
    "claimant": "<claimant 입력>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## claims_release

출처: Ruflo 원본

### 기능과 사용 시점

Release a claim on an issue Use when nothing native covers per-agent capability gating — Claude Code agents have file-system access by default. Pair claims_grant + claims_check before letting an agent run privileged ops. For trusted in-session work, no claims call is needed.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| issueId | string | 예 | Issue ID to release | — |
| claimant | string | 예 | Claimant identifier (must match current owner) | — |
| reason | string | 아니오 | Reason for releasing | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "issueId": {
      "type": "string",
      "description": "Issue ID to release"
    },
    "claimant": {
      "type": "string",
      "description": "Claimant identifier (must match current owner)"
    },
    "reason": {
      "type": "string",
      "description": "Reason for releasing"
    }
  },
  "required": [
    "issueId",
    "claimant"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "claims_release",
  "arguments": {
    "issueId": "<앞 단계에서 받은 ID>",
    "claimant": "<claimant 입력>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## claims_handoff

출처: Ruflo 원본

### 기능과 사용 시점

Request handoff of an issue to another claimant Use when nothing native covers per-agent capability gating — Claude Code agents have file-system access by default. Pair claims_grant + claims_check before letting an agent run privileged ops. For trusted in-session work, no claims call is needed.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| issueId | string | 예 | Issue ID to handoff | — |
| from | string | 예 | Current claimant identifier | — |
| to | string | 예 | Target claimant identifier | — |
| reason | string | 아니오 | Reason for handoff | — |
| progress | number | 아니오 | Current progress percentage (0-100) | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "issueId": {
      "type": "string",
      "description": "Issue ID to handoff"
    },
    "from": {
      "type": "string",
      "description": "Current claimant identifier"
    },
    "to": {
      "type": "string",
      "description": "Target claimant identifier"
    },
    "reason": {
      "type": "string",
      "description": "Reason for handoff"
    },
    "progress": {
      "type": "number",
      "description": "Current progress percentage (0-100)"
    }
  },
  "required": [
    "issueId",
    "from",
    "to"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "claims_handoff",
  "arguments": {
    "issueId": "<앞 단계에서 받은 ID>",
    "from": "<from 입력>",
    "to": "<to 입력>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## claims_accept-handoff

출처: Ruflo 원본

### 기능과 사용 시점

Accept a pending handoff Use when nothing native covers per-agent capability gating — Claude Code agents have file-system access by default. Pair claims_grant + claims_check before letting an agent run privileged ops. For trusted in-session work, no claims call is needed.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| issueId | string | 예 | Issue ID with pending handoff | — |
| claimant | string | 예 | Claimant accepting the handoff | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "issueId": {
      "type": "string",
      "description": "Issue ID with pending handoff"
    },
    "claimant": {
      "type": "string",
      "description": "Claimant accepting the handoff"
    }
  },
  "required": [
    "issueId",
    "claimant"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "claims_accept-handoff",
  "arguments": {
    "issueId": "<앞 단계에서 받은 ID>",
    "claimant": "<claimant 입력>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## claims_status

출처: Ruflo 원본

### 기능과 사용 시점

Update claim status Use when nothing native covers per-agent capability gating — Claude Code agents have file-system access by default. Pair claims_grant + claims_check before letting an agent run privileged ops. For trusted in-session work, no claims call is needed.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| issueId | string | 예 | Issue ID | — |
| status | string | 예 | New status | {"enum":["active","paused","blocked","review-requested","completed"]} |
| note | string | 아니오 | Status note or reason | — |
| progress | number | 아니오 | Current progress percentage | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "issueId": {
      "type": "string",
      "description": "Issue ID"
    },
    "status": {
      "type": "string",
      "description": "New status",
      "enum": [
        "active",
        "paused",
        "blocked",
        "review-requested",
        "completed"
      ]
    },
    "note": {
      "type": "string",
      "description": "Status note or reason"
    },
    "progress": {
      "type": "number",
      "description": "Current progress percentage"
    }
  },
  "required": [
    "issueId",
    "status"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "claims_status",
  "arguments": {
    "issueId": "<앞 단계에서 받은 ID>",
    "status": "active"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## claims_list

출처: Ruflo 원본

### 기능과 사용 시점

List all claims or filter by criteria Use when nothing native covers per-agent capability gating — Claude Code agents have file-system access by default. Pair claims_grant + claims_check before letting an agent run privileged ops. For trusted in-session work, no claims call is needed.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| status | string | 아니오 | Filter by status | {"enum":["active","paused","blocked","stealable","completed","all"]} |
| claimant | string | 아니오 | Filter by claimant | — |
| agentType | string | 아니오 | Filter by agent type | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "status": {
      "type": "string",
      "description": "Filter by status",
      "enum": [
        "active",
        "paused",
        "blocked",
        "stealable",
        "completed",
        "all"
      ]
    },
    "claimant": {
      "type": "string",
      "description": "Filter by claimant"
    },
    "agentType": {
      "type": "string",
      "description": "Filter by agent type"
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "claims_list",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## claims_mark-stealable

출처: Ruflo 원본

### 기능과 사용 시점

Mark an issue as stealable by other agents Use when nothing native covers per-agent capability gating — Claude Code agents have file-system access by default. Pair claims_grant + claims_check before letting an agent run privileged ops. For trusted in-session work, no claims call is needed.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| issueId | string | 예 | Issue ID to mark stealable | — |
| reason | string | 예 | Reason for marking stealable | {"enum":["overloaded","stale","blocked-timeout","voluntary"]} |
| preferredTypes | array | 아니오 | Preferred agent types to steal | — |
| context | string | 아니오 | Handoff context for the stealer | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "issueId": {
      "type": "string",
      "description": "Issue ID to mark stealable"
    },
    "reason": {
      "type": "string",
      "description": "Reason for marking stealable",
      "enum": [
        "overloaded",
        "stale",
        "blocked-timeout",
        "voluntary"
      ]
    },
    "preferredTypes": {
      "type": "array",
      "description": "Preferred agent types to steal",
      "items": {
        "type": "string"
      }
    },
    "context": {
      "type": "string",
      "description": "Handoff context for the stealer"
    }
  },
  "required": [
    "issueId",
    "reason"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "claims_mark-stealable",
  "arguments": {
    "issueId": "<앞 단계에서 받은 ID>",
    "reason": "overloaded"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## claims_steal

출처: Ruflo 원본

### 기능과 사용 시점

Steal a stealable issue Use when nothing native covers per-agent capability gating — Claude Code agents have file-system access by default. Pair claims_grant + claims_check before letting an agent run privileged ops. For trusted in-session work, no claims call is needed.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| issueId | string | 예 | Issue ID to steal | — |
| stealer | string | 예 | Claimant stealing the issue | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "issueId": {
      "type": "string",
      "description": "Issue ID to steal"
    },
    "stealer": {
      "type": "string",
      "description": "Claimant stealing the issue"
    }
  },
  "required": [
    "issueId",
    "stealer"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "claims_steal",
  "arguments": {
    "issueId": "<앞 단계에서 받은 ID>",
    "stealer": "<stealer 입력>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## claims_stealable

출처: Ruflo 원본

### 기능과 사용 시점

List all stealable issues Use when nothing native covers per-agent capability gating — Claude Code agents have file-system access by default. Pair claims_grant + claims_check before letting an agent run privileged ops. For trusted in-session work, no claims call is needed.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| agentType | string | 아니오 | Filter by preferred agent type | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "agentType": {
      "type": "string",
      "description": "Filter by preferred agent type"
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "claims_stealable",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## claims_load

출처: Ruflo 원본

### 기능과 사용 시점

Get agent load information Use when nothing native covers per-agent capability gating — Claude Code agents have file-system access by default. Pair claims_grant + claims_check before letting an agent run privileged ops. For trusted in-session work, no claims call is needed.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| agentId | string | 아니오 | Specific agent ID (optional) | — |
| agentType | string | 아니오 | Filter by agent type | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "agentId": {
      "type": "string",
      "description": "Specific agent ID (optional)"
    },
    "agentType": {
      "type": "string",
      "description": "Filter by agent type"
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "claims_load",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## claims_board

출처: Ruflo 원본

### 기능과 사용 시점

Get a visual board view of all claims Use when nothing native covers per-agent capability gating — Claude Code agents have file-system access by default. Pair claims_grant + claims_check before letting an agent run privileged ops. For trusted in-session work, no claims call is needed.

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
  "name": "claims_board",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## claims_rebalance

출처: Ruflo 원본

### 기능과 사용 시점

Suggest or apply load rebalancing across agents Use when nothing native covers per-agent capability gating — Claude Code agents have file-system access by default. Pair claims_grant + claims_check before letting an agent run privileged ops. For trusted in-session work, no claims call is needed.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| dryRun | boolean | 아니오 | Preview rebalancing without applying | {"default":true} |
| targetUtilization | number | 아니오 | Target utilization (0-1) | {"default":0.7} |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "dryRun": {
      "type": "boolean",
      "description": "Preview rebalancing without applying",
      "default": true
    },
    "targetUtilization": {
      "type": "number",
      "description": "Target utilization (0-1)",
      "default": 0.7
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "claims_rebalance",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.
