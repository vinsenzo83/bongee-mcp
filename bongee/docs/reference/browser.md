# 브라우저 조작·기록

[전체 목차](../MANUAL.md) · [사용 순서](../WORKFLOWS.md)

- [browser_session_record](#browser_session_record)
- [browser_session_end](#browser_session_end)
- [browser_session_replay](#browser_session_replay)
- [browser_template_apply](#browser_template_apply)
- [browser_cookie_use](#browser_cookie_use)
- [browser_act](#browser_act)

## browser_session_record

출처: Ruflo 원본

### 기능과 사용 시점

Open a named, traced browser session: allocate an RVF cognitive container, begin a ruvector trajectory, then open the URL via agent-browser. Returns the session id and rvf path. Use when native WebFetch is wrong because you need real browser automation — JS-heavy SPA scraping, login flows with cookie reuse, replay against DOM-drifted versions, AIDefence PII gating before content reaches Claude. For static HTML pages, native WebFetch is faster and free.

### 연결·실행 조건

로컬 브라우저 실행 환경과 대상 사이트 접근 권한. 로그인 상태·쿠키는 대상 사이트별로 준비합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| url | string | 예 | Target URL to open | — |
| task | string | 예 | Human-readable task description (recorded in trajectory) | — |
| session | string | 아니오 | Optional explicit session id; otherwise auto-generated | — |
| rvf_dir | string | 아니오 | Override the default .ruflo/browser-sessions directory | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "url": {
      "type": "string",
      "description": "Target URL to open"
    },
    "task": {
      "type": "string",
      "description": "Human-readable task description (recorded in trajectory)"
    },
    "session": {
      "type": "string",
      "description": "Optional explicit session id; otherwise auto-generated"
    },
    "rvf_dir": {
      "type": "string",
      "description": "Override the default .ruflo/browser-sessions directory"
    }
  },
  "required": [
    "url",
    "task"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "browser_session_record",
  "arguments": {
    "url": "https://example.com",
    "task": "<task 입력>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## browser_session_end

출처: Ruflo 원본

### 기능과 사용 시점

End a recorded browser session: trajectory-end with verdict, rvf compact, AIDefence pre-store gate (best-effort), and AgentDB index in the browser-sessions namespace. Use when native WebFetch is wrong because you need real browser automation — JS-heavy SPA scraping, login flows with cookie reuse, replay against DOM-drifted versions, AIDefence PII gating before content reaches Claude. For static HTML pages, native WebFetch is faster and free.

### 연결·실행 조건

로컬 브라우저 실행 환경과 대상 사이트 접근 권한. 로그인 상태·쿠키는 대상 사이트별로 준비합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| session | string | 예 | Session id (returned from browser_session_record) | — |
| rvf_path | string | 예 | Path to the .rvf container | — |
| verdict | string | 예 | Outcome verdict | {"enum":["pass","fail","partial"]} |
| host | string | 아니오 | Host (for namespace key); inferred from manifest if omitted | — |
| task | string | 아니오 | Task description (recorded for index) | — |
| tags | array | 아니오 | Optional tags for AgentDB index | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "session": {
      "type": "string",
      "description": "Session id (returned from browser_session_record)"
    },
    "rvf_path": {
      "type": "string",
      "description": "Path to the .rvf container"
    },
    "verdict": {
      "type": "string",
      "enum": [
        "pass",
        "fail",
        "partial"
      ],
      "description": "Outcome verdict"
    },
    "host": {
      "type": "string",
      "description": "Host (for namespace key); inferred from manifest if omitted"
    },
    "task": {
      "type": "string",
      "description": "Task description (recorded for index)"
    },
    "tags": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Optional tags for AgentDB index"
    }
  },
  "required": [
    "session",
    "rvf_path",
    "verdict"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "browser_session_end",
  "arguments": {
    "session": "<session 입력>",
    "rvf_path": "/absolute/path/my-project",
    "verdict": "pass"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## browser_session_replay

출처: Ruflo 원본

### 기능과 사용 시점

Load a recorded session trajectory and return its steps so the caller can dispatch them through the 23 browser_* tools. Does NOT itself drive the browser — replay execution is caller-orchestrated to keep this tool a primitive (ADR-0001 §7). Use when native WebFetch is wrong because you need real browser automation — JS-heavy SPA scraping, login flows with cookie reuse, replay against DOM-drifted versions, AIDefence PII gating before content reaches Claude. For static HTML pages, native WebFetch is faster and free.

### 연결·실행 조건

로컬 브라우저 실행 환경과 대상 사이트 접근 권한. 로그인 상태·쿠키는 대상 사이트별로 준비합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| session | string | 예 | Source session id to replay | — |
| rvf_path | string | 예 | Path to source .rvf container | — |
| url_override | string | 아니오 | Optional URL to use instead of the original | — |
| derive | boolean | 아니오 | Derive a new RVF child container for the replay run (default true) | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "session": {
      "type": "string",
      "description": "Source session id to replay"
    },
    "rvf_path": {
      "type": "string",
      "description": "Path to source .rvf container"
    },
    "url_override": {
      "type": "string",
      "description": "Optional URL to use instead of the original"
    },
    "derive": {
      "type": "boolean",
      "description": "Derive a new RVF child container for the replay run (default true)"
    }
  },
  "required": [
    "session",
    "rvf_path"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "browser_session_replay",
  "arguments": {
    "session": "<session 입력>",
    "rvf_path": "/absolute/path/my-project"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## browser_template_apply

출처: Ruflo 원본

### 기능과 사용 시점

Fetch a recipe from the browser-templates AgentDB namespace and return it for caller-level execution. Use when native WebFetch is wrong because you need real browser automation — JS-heavy SPA scraping, login flows with cookie reuse, replay against DOM-drifted versions, AIDefence PII gating before content reaches Claude. For static HTML pages, native WebFetch is faster and free.

### 연결·실행 조건

로컬 브라우저 실행 환경과 대상 사이트 접근 권한. 로그인 상태·쿠키는 대상 사이트별로 준비합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| name | string | 예 | Template name (key in browser-templates namespace) | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "Template name (key in browser-templates namespace)"
    }
  },
  "required": [
    "name"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "browser_template_apply",
  "arguments": {
    "name": "<name 입력>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## browser_cookie_use

출처: Ruflo 원본

### 기능과 사용 시점

Fetch a vault handle for a host from the browser-cookies AgentDB namespace. Raw cookie values are NEVER returned — only the opaque handle plus expiry / AIDefence verdict. Use when native WebFetch is wrong because you need real browser automation — JS-heavy SPA scraping, login flows with cookie reuse, replay against DOM-drifted versions, AIDefence PII gating before content reaches Claude. For static HTML pages, native WebFetch is faster and free.

### 연결·실행 조건

로컬 브라우저 실행 환경과 대상 사이트 접근 권한. 로그인 상태·쿠키는 대상 사이트별로 준비합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| host | string | 예 | Host (e.g. "example.com") to look up | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "host": {
      "type": "string",
      "description": "Host (e.g. \"example.com\") to look up"
    }
  },
  "required": [
    "host"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "browser_cookie_use",
  "arguments": {
    "host": "<host 입력>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## browser_act

출처: Ruflo 원본

### 기능과 사용 시점

Use when a target element is easier to describe than to select, or when an intent spans several steps: executes a natural-language instruction on the current page via page-agent (e.g. "Click the login button", "Fill the search box with cats and submit"). Prefer this over chaining browser_snapshot + browser_click/fill for such multi-step intents; pair with browser_open/browser_screenshot for navigation and visual verification (page-agent is text-DOM only, so it is blind to canvas/visual-only UIs — keep the selector + screenshot tools for those). Falls back to {degraded:true} when page-agent is not installed or no OpenAI-compatible LLM provider is configured (set OPENROUTER_API_KEY or OLLAMA_API_KEY; a bare ANTHROPIC_API_KEY is not sufficient — page-agent requires a /chat/completions-shaped endpoint).

### 연결·실행 조건

로컬 브라우저 실행 환경과 대상 사이트 접근 권한. 로그인 상태·쿠키는 대상 사이트별로 준비합니다.

스키마·원본 설명에 계정/토큰 요건이 있습니다. 예시의 자리표시자를 실제 값으로 바꾸되 저장소에 커밋하지 마세요. AI 공급자 키와 서비스 접근 권한은 별개입니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| task | string | 예 | Natural-language instruction, e.g. "Click the login button" | — |
| session | string | 아니오 | Session ID (default: "default") | — |
| url | string | 아니오 | Optional URL to navigate to before executing the intent | — |
| timeoutMs | number | 아니오 | Max time to wait for execute() to settle (default 120000) | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "task": {
      "type": "string",
      "description": "Natural-language instruction, e.g. \"Click the login button\""
    },
    "session": {
      "type": "string",
      "description": "Session ID (default: \"default\")"
    },
    "url": {
      "type": "string",
      "description": "Optional URL to navigate to before executing the intent"
    },
    "timeoutMs": {
      "type": "number",
      "description": "Max time to wait for execute() to settle (default 120000)"
    }
  },
  "required": [
    "task"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "browser_act",
  "arguments": {
    "task": "<task 입력>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.
