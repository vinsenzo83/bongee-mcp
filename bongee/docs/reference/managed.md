# 관리형 클라우드 에이전트

[전체 목차](../MANUAL.md) · [사용 순서](../WORKFLOWS.md)

- [managed_agent_create](#managed_agent_create)
- [managed_agent_prompt](#managed_agent_prompt)
- [managed_agent_status](#managed_agent_status)
- [managed_agent_events](#managed_agent_events)
- [managed_agent_list](#managed_agent_list)
- [managed_agent_terminate](#managed_agent_terminate)

## managed_agent_create

출처: Ruflo 원본

### 기능과 사용 시점

Spin up an Anthropic-managed cloud agent (Agent + Environment + Session) — the CLOUD counterpart of wasm_agent_create. Use when wasm_agent_create (local WASM sandbox) is wrong because the task is long-running/async (minutes-hours), needs a real cloud container with pre-installed packages + network, or persistent filesystem + transcript across turns. For a fast, free, ephemeral, offline agent use wasm_agent_create (rvagent). Needs ANTHROPIC_API_KEY + Managed Agents beta access. Returns {sessionId, agentId, environmentId}; pair with managed_agent_prompt.

### 연결·실행 조건

Anthropic 관리형 에이전트 서비스 연결·권한이 필요합니다. 로컬 로그인 세션 실행과 동일한 서비스가 아닙니다.

스키마·원본 설명에 계정/토큰 요건이 있습니다. 예시의 자리표시자를 실제 값으로 바꾸되 저장소에 커밋하지 마세요. AI 공급자 키와 서비스 접근 권한은 별개입니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| name | string | 아니오 | Agent name (default: auto) | — |
| model | string | 아니오 | Model id (default: claude-sonnet-4-6) | — |
| system | string | 아니오 | System prompt | — |
| title | string | 아니오 | Session title | — |
| mcpServers | array | 아니오 | MCP servers to expose to the agent — each {type:"url", url, name, authorization_token?}. NOTE: the cloud agent must be able to *reach* the URL (a local `ruflo mcp start` is not reachable from Anthropic's cloud — deploy/tunnel it). | — |
| skills | array | 아니오 | Skills to attach to the agent | — |
| packages | object | 아니오 | Environment packages: {pip?:[], npm?:[], apt?:[], cargo?:[], gem?:[], go?:[]} | — |
| networking | string | 아니오 | Environment networking (default: unrestricted) | {"enum":["unrestricted","restricted","none"]} |
| initScript | string | 아니오 | Environment init script (bash, run at container start) | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "Agent name (default: auto)"
    },
    "model": {
      "type": "string",
      "description": "Model id (default: claude-sonnet-4-6)"
    },
    "system": {
      "type": "string",
      "description": "System prompt"
    },
    "title": {
      "type": "string",
      "description": "Session title"
    },
    "mcpServers": {
      "type": "array",
      "description": "MCP servers to expose to the agent — each {type:\"url\", url, name, authorization_token?}. NOTE: the cloud agent must be able to *reach* the URL (a local `ruflo mcp start` is not reachable from Anthropic's cloud — deploy/tunnel it).",
      "items": {
        "type": "object"
      }
    },
    "skills": {
      "type": "array",
      "description": "Skills to attach to the agent",
      "items": {
        "type": "object"
      }
    },
    "packages": {
      "type": "object",
      "description": "Environment packages: {pip?:[], npm?:[], apt?:[], cargo?:[], gem?:[], go?:[]}"
    },
    "networking": {
      "type": "string",
      "enum": [
        "unrestricted",
        "restricted",
        "none"
      ],
      "description": "Environment networking (default: unrestricted)"
    },
    "initScript": {
      "type": "string",
      "description": "Environment init script (bash, run at container start)"
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "managed_agent_create",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## managed_agent_prompt

출처: Ruflo 원본

### 기능과 사용 시점

Send a user turn to a managed cloud-agent session and wait for it to go idle, returning the assistant text + a tool-use trace — the CLOUD counterpart of wasm_agent_prompt. Use when wasm_agent_prompt (local WASM) is wrong because the work is long-running, needs the cloud container, or must persist across turns. Polls the session event log up to maxWaitMs (default 180s); for very long tasks raise maxWaitMs or follow up with managed_agent_events. Pair with managed_agent_create (for sessionId).

### 연결·실행 조건

Anthropic 관리형 에이전트 서비스 연결·권한이 필요합니다. 로컬 로그인 세션 실행과 동일한 서비스가 아닙니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| sessionId | string | 예 | Session id from managed_agent_create | — |
| message | string | 예 | The user turn / task for the agent | — |
| maxWaitMs | number | 아니오 | Max ms to wait for the session to go idle (default 180000, capped at 600000) | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "sessionId": {
      "type": "string",
      "description": "Session id from managed_agent_create"
    },
    "message": {
      "type": "string",
      "description": "The user turn / task for the agent"
    },
    "maxWaitMs": {
      "type": "number",
      "description": "Max ms to wait for the session to go idle (default 180000, capped at 600000)"
    }
  },
  "required": [
    "sessionId",
    "message"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "managed_agent_prompt",
  "arguments": {
    "sessionId": "<앞 단계에서 받은 ID>",
    "message": "<message 입력>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## managed_agent_status

출처: Ruflo 원본

### 기능과 사용 시점

Get the lifecycle state of a managed cloud-agent session: idle/running/error, title, last error. Use when native conversation memory is wrong because you need the cloud session's server-side status across turns rather than guessing. For a local WASM agent use wasm_agent_list. Pair with managed_agent_events for the full transcript.

### 연결·실행 조건

Anthropic 관리형 에이전트 서비스 연결·권한이 필요합니다. 로컬 로그인 세션 실행과 동일한 서비스가 아닙니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| sessionId | string | 예 | Session id | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "sessionId": {
      "type": "string",
      "description": "Session id"
    }
  },
  "required": [
    "sessionId"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "managed_agent_status",
  "arguments": {
    "sessionId": "<앞 단계에서 받은 ID>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## managed_agent_events

출처: Ruflo 원본

### 기능과 사용 시점

Fetch the full server-persisted event log of a managed cloud-agent session (user turns, agent thinking, tool_use, tool_result, status) — the transcript/artifact view, the CLOUD counterpart of wasm_agent_files. Use when native Read is wrong because the work happened in Anthropic's cloud container, not on disk. For a local WASM agent's filesystem use wasm_agent_files. Returns the events plus a summary (assistantText, toolUses).

### 연결·실행 조건

Anthropic 관리형 에이전트 서비스 연결·권한이 필요합니다. 로컬 로그인 세션 실행과 동일한 서비스가 아닙니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| sessionId | string | 예 | Session id | — |
| raw | boolean | 아니오 | Include the full raw event objects (default: summary + compact list) | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "sessionId": {
      "type": "string",
      "description": "Session id"
    },
    "raw": {
      "type": "boolean",
      "description": "Include the full raw event objects (default: summary + compact list)"
    }
  },
  "required": [
    "sessionId"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "managed_agent_events",
  "arguments": {
    "sessionId": "<앞 단계에서 받은 ID>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## managed_agent_list

출처: Ruflo 원본

### 기능과 사용 시점

List managed cloud-agent sessions on this Anthropic org (id, status, title) — the CLOUD counterpart of wasm_agent_list. Use when native conversation memory is wrong because you need to see which cloud sessions exist (and which are still running / billing) across turns. For local WASM agents use wasm_agent_list. Pair with managed_agent_terminate to clean up idle sessions.

### 연결·실행 조건

Anthropic 관리형 에이전트 서비스 연결·권한이 필요합니다. 로컬 로그인 세션 실행과 동일한 서비스가 아닙니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| limit | number | 아니오 | Max sessions to return (default 50) | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "limit": {
      "type": "number",
      "description": "Max sessions to return (default 50)"
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "managed_agent_list",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## managed_agent_terminate

출처: Ruflo 원본

### 기능과 사용 시점

Delete a managed cloud-agent session (stops billing for it) — the CLOUD counterpart of wasm_agent_terminate. Use when native nothing applies because a cloud session keeps billing container time + tokens until deleted. For a local WASM agent use wasm_agent_terminate. Optionally also deletes the session's environment. Always call this when done with a managed agent.

### 연결·실행 조건

Anthropic 관리형 에이전트 서비스 연결·권한이 필요합니다. 로컬 로그인 세션 실행과 동일한 서비스가 아닙니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| sessionId | string | 예 | Session id to delete | — |
| environmentId | string | 아니오 | Optional: also delete this environment (the one returned by managed_agent_create) | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "sessionId": {
      "type": "string",
      "description": "Session id to delete"
    },
    "environmentId": {
      "type": "string",
      "description": "Optional: also delete this environment (the one returned by managed_agent_create)"
    }
  },
  "required": [
    "sessionId"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "managed_agent_terminate",
  "arguments": {
    "sessionId": "<앞 단계에서 받은 ID>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.
