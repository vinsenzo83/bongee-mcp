# WASM 에이전트·갤러리

[전체 목차](../MANUAL.md) · [사용 순서](../WORKFLOWS.md)

- [wasm_agent_create](#wasm_agent_create)
- [wasm_agent_prompt](#wasm_agent_prompt)
- [wasm_agent_tool](#wasm_agent_tool)
- [wasm_agent_list](#wasm_agent_list)
- [wasm_agent_terminate](#wasm_agent_terminate)
- [wasm_agent_files](#wasm_agent_files)
- [wasm_agent_export](#wasm_agent_export)
- [wasm_gallery_list](#wasm_gallery_list)
- [wasm_gallery_search](#wasm_gallery_search)
- [wasm_gallery_create](#wasm_gallery_create)
- [wasm_agent_compose](#wasm_agent_compose)
- [wasm_agent_state](#wasm_agent_state)
- [wasm_agent_todos](#wasm_agent_todos)
- [wasm_agent_tools](#wasm_agent_tools)
- [wasm_agent_turn_count](#wasm_agent_turn_count)
- [wasm_agent_is_stopped](#wasm_agent_is_stopped)
- [wasm_agent_reset](#wasm_agent_reset)
- [wasm_gallery_load_rvf](#wasm_gallery_load_rvf)
- [wasm_gallery_configure](#wasm_gallery_configure)
- [wasm_gallery_categories](#wasm_gallery_categories)
- [wasm_gallery_list_by_category](#wasm_gallery_list_by_category)
- [wasm_gallery_add_custom](#wasm_gallery_add_custom)
- [wasm_gallery_remove_custom](#wasm_gallery_remove_custom)
- [wasm_gallery_import](#wasm_gallery_import)
- [wasm_gallery_export](#wasm_gallery_export)
- [wasm_gallery_active](#wasm_gallery_active)
- [wasm_gallery_config](#wasm_gallery_config)

## wasm_agent_create

출처: Ruflo 원본

### 기능과 사용 시점

Create a sandboxed WASM agent with virtual filesystem (no OS access). Optionally use a gallery template. Use when native Task is wrong because the workload needs sandboxed isolation — untrusted code execution, browser-side run, deterministic replay. Pair with wasm_gallery_search to find a published agent, or wasm_agent_create to scaffold a fresh one. For trusted in-process work, native Task is fine.

### 연결·실행 조건

WASM 런타임/선택적 패키지와 모델 공급자 설정은 원본 구현을 따릅니다. 모든 WASM 모델 호출이 세션으로 대체된 것은 아닙니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| template | string | 아니오 | Gallery template name (coder, researcher, tester, reviewer, security, swarm) | — |
| model | string | 아니오 | Model identifier (default: anthropic:claude-sonnet-4-6) | — |
| instructions | string | 아니오 | System instructions for the agent | — |
| maxTurns | number | 아니오 | Max conversation turns (default: 50) | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "template": {
      "type": "string",
      "description": "Gallery template name (coder, researcher, tester, reviewer, security, swarm)"
    },
    "model": {
      "type": "string",
      "description": "Model identifier (default: anthropic:claude-sonnet-4-6)"
    },
    "instructions": {
      "type": "string",
      "description": "System instructions for the agent"
    },
    "maxTurns": {
      "type": "number",
      "description": "Max conversation turns (default: 50)"
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "wasm_agent_create",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## wasm_agent_prompt

출처: Ruflo 원본

### 기능과 사용 시점

Send a prompt to a WASM agent and get a response. Use when native Task is wrong because the workload needs sandboxed isolation — untrusted code execution, browser-side run, deterministic replay. Pair with wasm_gallery_search to find a published agent, or wasm_agent_create to scaffold a fresh one. For trusted in-process work, native Task is fine.

### 연결·실행 조건

WASM 런타임/선택적 패키지와 모델 공급자 설정은 원본 구현을 따릅니다. 모든 WASM 모델 호출이 세션으로 대체된 것은 아닙니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| agentId | string | 예 | WASM agent ID | — |
| input | string | 예 | User prompt to send | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "agentId": {
      "type": "string",
      "description": "WASM agent ID"
    },
    "input": {
      "type": "string",
      "description": "User prompt to send"
    }
  },
  "required": [
    "agentId",
    "input"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "wasm_agent_prompt",
  "arguments": {
    "agentId": "<앞 단계에서 받은 ID>",
    "input": "<input 입력>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## wasm_agent_tool

출처: Ruflo 원본

### 기능과 사용 시점

Execute a tool on a WASM agent sandbox. Tools: read_file, write_file, edit_file, write_todos, list_files. Use flat format: {tool, path, content, ...}. Use when native Task is wrong because the workload needs sandboxed isolation — untrusted code execution, browser-side run, deterministic replay. Pair with wasm_gallery_search to find a published agent, or wasm_agent_create to scaffold a fresh one. For trusted in-process work, native Task is fine.

### 연결·실행 조건

WASM 런타임/선택적 패키지와 모델 공급자 설정은 원본 구현을 따릅니다. 모든 WASM 모델 호출이 세션으로 대체된 것은 아닙니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| agentId | string | 예 | WASM agent ID | — |
| toolName | string | 예 | Tool name (read_file, write_file, edit_file, write_todos, list_files) | — |
| toolInput | object | 아니오 | Tool parameters (flat: {path, content, old_string, new_string, todos}) | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "agentId": {
      "type": "string",
      "description": "WASM agent ID"
    },
    "toolName": {
      "type": "string",
      "description": "Tool name (read_file, write_file, edit_file, write_todos, list_files)"
    },
    "toolInput": {
      "type": "object",
      "description": "Tool parameters (flat: {path, content, old_string, new_string, todos})"
    }
  },
  "required": [
    "agentId",
    "toolName"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "wasm_agent_tool",
  "arguments": {
    "agentId": "<앞 단계에서 받은 ID>",
    "toolName": "<toolName 입력>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## wasm_agent_list

출처: Ruflo 원본

### 기능과 사용 시점

List all active WASM agents. Use when native Task is wrong because the workload needs sandboxed isolation — untrusted code execution, browser-side run, deterministic replay. Pair with wasm_gallery_search to find a published agent, or wasm_agent_create to scaffold a fresh one. For trusted in-process work, native Task is fine.

### 연결·실행 조건

WASM 런타임/선택적 패키지와 모델 공급자 설정은 원본 구현을 따릅니다. 모든 WASM 모델 호출이 세션으로 대체된 것은 아닙니다.

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
  "name": "wasm_agent_list",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## wasm_agent_terminate

출처: Ruflo 원본

### 기능과 사용 시점

Terminate a WASM agent and free resources. Use when native Task is wrong because the workload needs sandboxed isolation — untrusted code execution, browser-side run, deterministic replay. Pair with wasm_gallery_search to find a published agent, or wasm_agent_create to scaffold a fresh one. For trusted in-process work, native Task is fine.

### 연결·실행 조건

WASM 런타임/선택적 패키지와 모델 공급자 설정은 원본 구현을 따릅니다. 모든 WASM 모델 호출이 세션으로 대체된 것은 아닙니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| agentId | string | 예 | WASM agent ID | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "agentId": {
      "type": "string",
      "description": "WASM agent ID"
    }
  },
  "required": [
    "agentId"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "wasm_agent_terminate",
  "arguments": {
    "agentId": "<앞 단계에서 받은 ID>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## wasm_agent_files

출처: Ruflo 원본

### 기능과 사용 시점

Get a WASM agent's available tools and info. Use when native Task is wrong because the workload needs sandboxed isolation — untrusted code execution, browser-side run, deterministic replay. Pair with wasm_gallery_search to find a published agent, or wasm_agent_create to scaffold a fresh one. For trusted in-process work, native Task is fine.

### 연결·실행 조건

WASM 런타임/선택적 패키지와 모델 공급자 설정은 원본 구현을 따릅니다. 모든 WASM 모델 호출이 세션으로 대체된 것은 아닙니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| agentId | string | 예 | WASM agent ID | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "agentId": {
      "type": "string",
      "description": "WASM agent ID"
    }
  },
  "required": [
    "agentId"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "wasm_agent_files",
  "arguments": {
    "agentId": "<앞 단계에서 받은 ID>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## wasm_agent_export

출처: Ruflo 원본

### 기능과 사용 시점

Export a WASM agent's full state (config, filesystem, conversation) as JSON. Use when native Task is wrong because the workload needs sandboxed isolation — untrusted code execution, browser-side run, deterministic replay. Pair with wasm_gallery_search to find a published agent, or wasm_agent_create to scaffold a fresh one. For trusted in-process work, native Task is fine.

### 연결·실행 조건

WASM 런타임/선택적 패키지와 모델 공급자 설정은 원본 구현을 따릅니다. 모든 WASM 모델 호출이 세션으로 대체된 것은 아닙니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| agentId | string | 예 | WASM agent ID | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "agentId": {
      "type": "string",
      "description": "WASM agent ID"
    }
  },
  "required": [
    "agentId"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "wasm_agent_export",
  "arguments": {
    "agentId": "<앞 단계에서 받은 ID>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## wasm_gallery_list

출처: Ruflo 원본

### 기능과 사용 시점

List all available WASM agent gallery templates (Coder, Researcher, Tester, Reviewer, Security, Swarm). Use when native Task is wrong because the workload needs sandboxed isolation — untrusted code execution, browser-side run, deterministic replay. Pair with wasm_gallery_search to find a published agent, or wasm_agent_create to scaffold a fresh one. For trusted in-process work, native Task is fine.

### 연결·실행 조건

WASM 런타임/선택적 패키지와 모델 공급자 설정은 원본 구현을 따릅니다. 모든 WASM 모델 호출이 세션으로 대체된 것은 아닙니다.

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
  "name": "wasm_gallery_list",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## wasm_gallery_search

출처: Ruflo 원본

### 기능과 사용 시점

Search WASM agent gallery templates by query. Use when native Task is wrong because the workload needs sandboxed isolation — untrusted code execution, browser-side run, deterministic replay. Pair with wasm_gallery_search to find a published agent, or wasm_agent_create to scaffold a fresh one. For trusted in-process work, native Task is fine.

### 연결·실행 조건

WASM 런타임/선택적 패키지와 모델 공급자 설정은 원본 구현을 따릅니다. 모든 WASM 모델 호출이 세션으로 대체된 것은 아닙니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| query | string | 예 | Search query | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "query": {
      "type": "string",
      "description": "Search query"
    }
  },
  "required": [
    "query"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "wasm_gallery_search",
  "arguments": {
    "query": "<query 입력>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## wasm_gallery_create

출처: Ruflo 원본

### 기능과 사용 시점

Create a WASM agent from a gallery template. Use when native Task is wrong because the workload needs sandboxed isolation — untrusted code execution, browser-side run, deterministic replay. Pair with wasm_gallery_search to find a published agent, or wasm_agent_create to scaffold a fresh one. For trusted in-process work, native Task is fine.

### 연결·실행 조건

WASM 런타임/선택적 패키지와 모델 공급자 설정은 원본 구현을 따릅니다. 모든 WASM 모델 호출이 세션으로 대체된 것은 아닙니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| template | string | 예 | Template name (coder, researcher, tester, reviewer, security, swarm) | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "template": {
      "type": "string",
      "description": "Template name (coder, researcher, tester, reviewer, security, swarm)"
    }
  },
  "required": [
    "template"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "wasm_gallery_create",
  "arguments": {
    "template": "<template 입력>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## wasm_agent_compose

출처: Ruflo 원본

### 기능과 사용 시점

Compose an RVF container with explicit skills, MCP tool descriptors, prompts, and tools. Returns base64-encoded RVF bytes + a manifest of what was packed. SECURITY: mcpTools accepts only an explicit allowlist — never pass "*". Destructive tools (memory_delete, *_shutdown, federation_*, etc.) require mcpToolsAllowDestructive: true. Use includePlugins to auto-wire skills from plugins that declare rvagent.exposeSkillsAsTools.

### 연결·실행 조건

WASM 런타임/선택적 패키지와 모델 공급자 설정은 원본 구현을 따릅니다. 모든 WASM 모델 호출이 세션으로 대체된 것은 아닙니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| name | string | 아니오 | Optional name for the composed agent | — |
| model | string | 아니오 | Model identifier (default: anthropic:claude-sonnet-4-6) | — |
| skills | array | 아니오 | Skill names to include | — |
| mcpTools | array | 아니오 | Explicit allowlist of MCP tool names to embed (principle of least privilege) | — |
| mcpToolsAllowDestructive | boolean | 아니오 | Set true to allow destructive tools (*_delete, *_shutdown, federation_*, etc.) | — |
| prompts | array | 아니오 | Prompt objects to embed | — |
| tools | array | 아니오 | Tool definitions to embed | — |
| includePlugins | array | 아니오 | Plugin names whose rvagent.exposeSkillsAsTools skills should be included | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "Optional name for the composed agent"
    },
    "model": {
      "type": "string",
      "description": "Model identifier (default: anthropic:claude-sonnet-4-6)"
    },
    "skills": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Skill names to include"
    },
    "mcpTools": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Explicit allowlist of MCP tool names to embed (principle of least privilege)"
    },
    "mcpToolsAllowDestructive": {
      "type": "boolean",
      "description": "Set true to allow destructive tools (*_delete, *_shutdown, federation_*, etc.)"
    },
    "prompts": {
      "type": "array",
      "items": {
        "type": "object"
      },
      "description": "Prompt objects to embed"
    },
    "tools": {
      "type": "array",
      "items": {
        "type": "object"
      },
      "description": "Tool definitions to embed"
    },
    "includePlugins": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Plugin names whose rvagent.exposeSkillsAsTools skills should be included"
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "wasm_agent_compose",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## wasm_agent_state

출처: Ruflo 원본

### 기능과 사용 시점

Read the full internal state of a WASM agent (messages, turn count, config, stop status). Use when native Task is wrong because the agent runs in a sandboxed WASM runtime whose internal conversation history is not directly accessible from the host process.

### 연결·실행 조건

WASM 런타임/선택적 패키지와 모델 공급자 설정은 원본 구현을 따릅니다. 모든 WASM 모델 호출이 세션으로 대체된 것은 아닙니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| agentId | string | 예 | WASM agent ID | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "agentId": {
      "type": "string",
      "description": "WASM agent ID"
    }
  },
  "required": [
    "agentId"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "wasm_agent_state",
  "arguments": {
    "agentId": "<앞 단계에서 받은 ID>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## wasm_agent_todos

출처: Ruflo 원본

### 기능과 사용 시점

Get the structured todo list of a WASM agent as JSON. Use when native Task is wrong because the todo state lives inside the sandboxed WASM runtime and is not visible to the host process.

### 연결·실행 조건

WASM 런타임/선택적 패키지와 모델 공급자 설정은 원본 구현을 따릅니다. 모든 WASM 모델 호출이 세션으로 대체된 것은 아닙니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| agentId | string | 예 | WASM agent ID | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "agentId": {
      "type": "string",
      "description": "WASM agent ID"
    }
  },
  "required": [
    "agentId"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "wasm_agent_todos",
  "arguments": {
    "agentId": "<앞 단계에서 받은 ID>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## wasm_agent_tools

출처: Ruflo 원본

### 기능과 사용 시점

List the tools registered on a WASM agent sandbox. Use when native Task is wrong because the tool registry lives inside the WASM runtime and cannot be inspected from the host via standard reflection.

### 연결·실행 조건

WASM 런타임/선택적 패키지와 모델 공급자 설정은 원본 구현을 따릅니다. 모든 WASM 모델 호출이 세션으로 대체된 것은 아닙니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| agentId | string | 예 | WASM agent ID | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "agentId": {
      "type": "string",
      "description": "WASM agent ID"
    }
  },
  "required": [
    "agentId"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "wasm_agent_tools",
  "arguments": {
    "agentId": "<앞 단계에서 받은 ID>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## wasm_agent_turn_count

출처: Ruflo 원본

### 기능과 사용 시점

Return the current turn count of a WASM agent. Use when native Task is wrong because turn-limit enforcement and progress tracking must be polled from inside the sandboxed WASM runtime rather than inferred externally.

### 연결·실행 조건

WASM 런타임/선택적 패키지와 모델 공급자 설정은 원본 구현을 따릅니다. 모든 WASM 모델 호출이 세션으로 대체된 것은 아닙니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| agentId | string | 예 | WASM agent ID | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "agentId": {
      "type": "string",
      "description": "WASM agent ID"
    }
  },
  "required": [
    "agentId"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "wasm_agent_turn_count",
  "arguments": {
    "agentId": "<앞 단계에서 받은 ID>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## wasm_agent_is_stopped

출처: Ruflo 원본

### 기능과 사용 시점

Check whether a WASM agent has reached its stop condition (max turns or explicit stop). Use when native Task is wrong because the stop condition is evaluated inside the WASM runtime and not observable from the host without an explicit query.

### 연결·실행 조건

WASM 런타임/선택적 패키지와 모델 공급자 설정은 원본 구현을 따릅니다. 모든 WASM 모델 호출이 세션으로 대체된 것은 아닙니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| agentId | string | 예 | WASM agent ID | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "agentId": {
      "type": "string",
      "description": "WASM agent ID"
    }
  },
  "required": [
    "agentId"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "wasm_agent_is_stopped",
  "arguments": {
    "agentId": "<앞 단계에서 받은 ID>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## wasm_agent_reset

출처: Ruflo 원본

### 기능과 사용 시점

Reset a WASM agent — clears messages and turn count so it can be reused across tasks. Use when native Task is wrong because the agent lives in a sandboxed WASM runtime that must be explicitly reset rather than simply re-spawned.

### 연결·실행 조건

WASM 런타임/선택적 패키지와 모델 공급자 설정은 원본 구현을 따릅니다. 모든 WASM 모델 호출이 세션으로 대체된 것은 아닙니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| agentId | string | 예 | WASM agent ID | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "agentId": {
      "type": "string",
      "description": "WASM agent ID"
    }
  },
  "required": [
    "agentId"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "wasm_agent_reset",
  "arguments": {
    "agentId": "<앞 단계에서 받은 ID>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## wasm_gallery_load_rvf

출처: Ruflo 원본

### 기능과 사용 시점

Load a named gallery template as a base64-encoded RVF container. Use when native Read is wrong because RVF containers are packed inside the WASM gallery store and are not accessible as plain filesystem files.

### 연결·실행 조건

WASM 런타임/선택적 패키지와 모델 공급자 설정은 원본 구현을 따릅니다. 모든 WASM 모델 호출이 세션으로 대체된 것은 아닙니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| id | string | 예 | Gallery template ID | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "description": "Gallery template ID"
    }
  },
  "required": [
    "id"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "wasm_gallery_load_rvf",
  "arguments": {
    "id": "<앞 단계에서 받은 ID>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## wasm_gallery_configure

출처: Ruflo 원본

### 기능과 사용 시점

Apply runtime configuration overrides (e.g. maxTurns, model) to the active WASM gallery template. Use when native Edit is wrong because gallery configuration lives inside the WASM runtime state and cannot be changed via filesystem writes.

### 연결·실행 조건

WASM 런타임/선택적 패키지와 모델 공급자 설정은 원본 구현을 따릅니다. 모든 WASM 모델 호출이 세션으로 대체된 것은 아닙니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| config | object | 예 | Configuration overrides (e.g. {maxTurns: 100}) | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "config": {
      "type": "object",
      "description": "Configuration overrides (e.g. {maxTurns: 100})"
    }
  },
  "required": [
    "config"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "wasm_gallery_configure",
  "arguments": {
    "config": {}
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## wasm_gallery_categories

출처: Ruflo 원본

### 기능과 사용 시점

Return all WASM gallery template categories with per-category template counts. Use when native Bash/ls is wrong because gallery category metadata is indexed inside the WASM runtime, not on the filesystem.

### 연결·실행 조건

WASM 런타임/선택적 패키지와 모델 공급자 설정은 원본 구현을 따릅니다. 모든 WASM 모델 호출이 세션으로 대체된 것은 아닙니다.

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
  "name": "wasm_gallery_categories",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## wasm_gallery_list_by_category

출처: Ruflo 원본

### 기능과 사용 시점

List WASM gallery templates filtered to a specific category. Use when native Glob is wrong because gallery templates are stored in the WASM runtime registry, not as individual filesystem files.

### 연결·실행 조건

WASM 런타임/선택적 패키지와 모델 공급자 설정은 원본 구현을 따릅니다. 모든 WASM 모델 호출이 세션으로 대체된 것은 아닙니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| category | string | 예 | Category name | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "category": {
      "type": "string",
      "description": "Category name"
    }
  },
  "required": [
    "category"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "wasm_gallery_list_by_category",
  "arguments": {
    "category": "<category 입력>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## wasm_gallery_add_custom

출처: Ruflo 원본

### 기능과 사용 시점

Add a custom agent template to the WASM gallery registry. Use when native Write is wrong because custom templates must be registered inside the WASM runtime store, not written as plain files.

### 연결·실행 조건

WASM 런타임/선택적 패키지와 모델 공급자 설정은 원본 구현을 따릅니다. 모든 WASM 모델 호출이 세션으로 대체된 것은 아닙니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| template | object | 예 | Template object to add | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "template": {
      "type": "object",
      "description": "Template object to add"
    }
  },
  "required": [
    "template"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "wasm_gallery_add_custom",
  "arguments": {
    "template": {}
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## wasm_gallery_remove_custom

출처: Ruflo 원본

### 기능과 사용 시점

Remove a custom template from the WASM gallery by ID. Use when native Bash rm is wrong because custom templates exist only inside the WASM runtime registry and cannot be deleted via filesystem operations.

### 연결·실행 조건

WASM 런타임/선택적 패키지와 모델 공급자 설정은 원본 구현을 따릅니다. 모든 WASM 모델 호출이 세션으로 대체된 것은 아닙니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| id | string | 예 | Custom template ID to remove | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "description": "Custom template ID to remove"
    }
  },
  "required": [
    "id"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "wasm_gallery_remove_custom",
  "arguments": {
    "id": "<앞 단계에서 받은 ID>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## wasm_gallery_import

출처: Ruflo 원본

### 기능과 사용 시점

HIGH RISK: Import custom templates from JSON into the gallery. The payload is deserialized inside the WASM runtime — a malicious system_prompt in an imported template can direct agents toward harmful behavior. Input is scanned by AIDefence when available. Requires explicit confirmation of the source before use.

### 연결·실행 조건

WASM 런타임/선택적 패키지와 모델 공급자 설정은 원본 구현을 따릅니다. 모든 WASM 모델 호출이 세션으로 대체된 것은 아닙니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| templatesJson | string | 예 | JSON string of template array to import | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "templatesJson": {
      "type": "string",
      "description": "JSON string of template array to import"
    }
  },
  "required": [
    "templatesJson"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "wasm_gallery_import",
  "arguments": {
    "templatesJson": "<templatesJson 입력>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## wasm_gallery_export

출처: Ruflo 원본

### 기능과 사용 시점

Export all custom WASM gallery templates as a JSON snapshot. Use when native Read/cat is wrong because custom templates live inside the WASM runtime store and are not persisted as individual files on disk.

### 연결·실행 조건

WASM 런타임/선택적 패키지와 모델 공급자 설정은 원본 구현을 따릅니다. 모든 WASM 모델 호출이 세션으로 대체된 것은 아닙니다.

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
  "name": "wasm_gallery_export",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## wasm_gallery_active

출처: Ruflo 원본

### 기능과 사용 시점

Return the ID of the currently active WASM gallery template. Use when native Bash is wrong because the active-template cursor is tracked inside the WASM runtime state, not in a file you can read directly.

### 연결·실행 조건

WASM 런타임/선택적 패키지와 모델 공급자 설정은 원본 구현을 따릅니다. 모든 WASM 모델 호출이 세션으로 대체된 것은 아닙니다.

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
  "name": "wasm_gallery_active",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## wasm_gallery_config

출처: Ruflo 원본

### 기능과 사용 시점

Get the runtime configuration overrides applied to the active WASM gallery template. Use when native Read is wrong because gallery config overrides are stored in the WASM runtime state rather than as an editable config file.

### 연결·실행 조건

WASM 런타임/선택적 패키지와 모델 공급자 설정은 원본 구현을 따릅니다. 모든 WASM 모델 호출이 세션으로 대체된 것은 아닙니다.

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
  "name": "wasm_gallery_config",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.
