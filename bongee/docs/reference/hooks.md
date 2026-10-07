# 작업 훅·모델 라우팅·학습

[전체 목차](../MANUAL.md) · [사용 순서](../WORKFLOWS.md)

- [hooks_intelligence_unified-stats](#hooks_intelligence_unified-stats)
- [hooks_teammate-idle](#hooks_teammate-idle)
- [hooks_task-completed](#hooks_task-completed)
- [hooks_pre-edit](#hooks_pre-edit)
- [hooks_post-edit](#hooks_post-edit)
- [hooks_pre-command](#hooks_pre-command)
- [hooks_post-command](#hooks_post-command)
- [hooks_route](#hooks_route)
- [hooks_metrics](#hooks_metrics)
- [hooks_list](#hooks_list)
- [hooks_pre-task](#hooks_pre-task)
- [hooks_post-task](#hooks_post-task)
- [hooks_explain](#hooks_explain)
- [hooks_pretrain](#hooks_pretrain)
- [hooks_build-agents](#hooks_build-agents)
- [hooks_transfer](#hooks_transfer)
- [hooks_session-start](#hooks_session-start)
- [hooks_session-end](#hooks_session-end)
- [hooks_session-restore](#hooks_session-restore)
- [hooks_notify](#hooks_notify)
- [hooks_init](#hooks_init)
- [hooks_intelligence](#hooks_intelligence)
- [hooks_intelligence-reset](#hooks_intelligence-reset)
- [hooks_intelligence_trajectory-start](#hooks_intelligence_trajectory-start)
- [hooks_intelligence_trajectory-step](#hooks_intelligence_trajectory-step)
- [hooks_intelligence_trajectory-end](#hooks_intelligence_trajectory-end)
- [hooks_intelligence_pattern-store](#hooks_intelligence_pattern-store)
- [hooks_intelligence_pattern-search](#hooks_intelligence_pattern-search)
- [hooks_intelligence_stats](#hooks_intelligence_stats)
- [hooks_intelligence_learn](#hooks_intelligence_learn)
- [hooks_intelligence_attention](#hooks_intelligence_attention)
- [hooks_worker-list](#hooks_worker-list)
- [hooks_worker-dispatch](#hooks_worker-dispatch)
- [hooks_worker-status](#hooks_worker-status)
- [hooks_worker-detect](#hooks_worker-detect)
- [hooks_worker-cancel](#hooks_worker-cancel)
- [hooks_model-route](#hooks_model-route)
- [hooks_model-outcome](#hooks_model-outcome)
- [hooks_model-stats](#hooks_model-stats)
- [hooks_model-verify](#hooks_model-verify)
- [hooks_codemod](#hooks_codemod)
- [hooks_coverage-route](#hooks_coverage-route)
- [hooks_coverage-suggest](#hooks_coverage-suggest)
- [hooks_coverage-gaps](#hooks_coverage-gaps)

## hooks_intelligence_unified-stats

출처: Ruflo 원본

### 기능과 사용 시점

One honest view across the four learning stat sources: globalStats (`.claude-flow/neural/stats.json`), the in-memory SONA coordinator, memory-bridge AgentDB entries, and the neural-patterns store. Each sub-view names its source path. The `consistency` block notes cross-store drift (e.g. globalStats reports N patterns but neural_patterns is empty). See ADR-075. Use when calling the four narrow aggregators (`hooks_intelligence stats`, `memory_stats`, `neural_status`, the SONA coordinator getter) one at a time is wrong because they each see only their own slice and cross-store drift goes silent — this tool surfaces that drift in the `consistency` block, which the narrow APIs cannot.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| verbose | boolean | 아니오 | Include extended breakdowns | {"default":true} |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "verbose": {
      "type": "boolean",
      "description": "Include extended breakdowns",
      "default": true
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "hooks_intelligence_unified-stats",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## hooks_teammate-idle

출처: Ruflo 원본

### 기능과 사용 시점

Agent Teams hook — fired when a teammate agent finishes its turn; reports whether a pending task can be auto-assigned. Use when native Task is wrong because you have a persistent multi-agent team with a shared task list and want idle workers picked up automatically rather than re-spawning subagents. For a one-shot Task, native Task is fine. (Auto-assignment is delegated to the task-queue consumer — this acknowledges the event today.)

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| teammateId | string | 아니오 | ID of the idle teammate | — |
| teamName | string | 아니오 | Team name | — |
| autoAssign | boolean | 아니오 | Auto-assign a pending task if available | — |
| checkTaskList | boolean | 아니오 | Consult the shared task list | — |
| timestamp | number | 아니오 | Event timestamp (ms) | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "teammateId": {
      "type": "string",
      "description": "ID of the idle teammate"
    },
    "teamName": {
      "type": "string",
      "description": "Team name"
    },
    "autoAssign": {
      "type": "boolean",
      "description": "Auto-assign a pending task if available"
    },
    "checkTaskList": {
      "type": "boolean",
      "description": "Consult the shared task list"
    },
    "timestamp": {
      "type": "number",
      "description": "Event timestamp (ms)"
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "hooks_teammate-idle",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## hooks_task-completed

출처: Ruflo 원본

### 기능과 사용 시점

Agent Teams hook — fired when a task is marked complete. Records the completion and, when `trainPatterns:true`, feeds the outcome to the SONA + EWC++ learning pipeline (the same path used by hooks_intelligence trajectory-*). Multiple ways to drive learning exist: (a) call this with trainPatterns:true for a one-step trajectory, (b) use hooks_intelligence trajectory-start/step/end for richer multi-step learning, (c) just record an episode via memory_store if no learning is needed. Each path is honest about what it persists; check the returned `learningPath` field. Use when native TaskUpdate(status:completed) is wrong because the runtime also needs to (i) record the outcome as a learning signal and (ii) emit the standard "task done" pipeline event — TaskUpdate only changes the task row.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| taskId | string | 예 | ID of the completed task | — |
| teammateId | string | 아니오 | Teammate that completed it | — |
| success | boolean | 아니오 | Whether the task succeeded | — |
| quality | number | 아니오 | Quality score 0-1 | — |
| trainPatterns | boolean | 아니오 | When true, runs the SONA + EWC++ trajectory pipeline on this completion so globalStats.patternsLearned reflects it. When false (default), only records the completion. | — |
| notifyLead | boolean | 아니오 | Notify the team lead | — |
| content | string | 아니오 | Optional richer task description; used as the trajectory step content when training. Defaults to the taskId. | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "taskId": {
      "type": "string",
      "description": "ID of the completed task"
    },
    "teammateId": {
      "type": "string",
      "description": "Teammate that completed it"
    },
    "success": {
      "type": "boolean",
      "description": "Whether the task succeeded"
    },
    "quality": {
      "type": "number",
      "description": "Quality score 0-1"
    },
    "trainPatterns": {
      "type": "boolean",
      "description": "When true, runs the SONA + EWC++ trajectory pipeline on this completion so globalStats.patternsLearned reflects it. When false (default), only records the completion."
    },
    "notifyLead": {
      "type": "boolean",
      "description": "Notify the team lead"
    },
    "content": {
      "type": "string",
      "description": "Optional richer task description; used as the trajectory step content when training. Defaults to the taskId."
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
  "name": "hooks_task-completed",
  "arguments": {
    "taskId": "<앞 단계에서 받은 ID>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## hooks_pre-edit

출처: Ruflo 원본

### 기능과 사용 시점

Get context and agent suggestions before editing a file Use when native Bash hooks (via Claude Code's settings.json) are wrong because you need Ruflo-side state — pattern persistence, neural training signals, model-routing learning, cost tracking, audit chain. For one-off shell commands, plain Bash hooks are fine.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| filePath | string | 예 | Path to the file being edited | — |
| operation | string | 아니오 | Type of operation (create, update, delete, refactor) | — |
| context | string | 아니오 | Additional context | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "filePath": {
      "type": "string",
      "description": "Path to the file being edited"
    },
    "operation": {
      "type": "string",
      "description": "Type of operation (create, update, delete, refactor)"
    },
    "context": {
      "type": "string",
      "description": "Additional context"
    }
  },
  "required": [
    "filePath"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "hooks_pre-edit",
  "arguments": {
    "filePath": "/absolute/path/my-project"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## hooks_post-edit

출처: Ruflo 원본

### 기능과 사용 시점

Record editing outcome for learning Use when native Bash hooks (via Claude Code's settings.json) are wrong because you need Ruflo-side state — pattern persistence, neural training signals, model-routing learning, cost tracking, audit chain. For one-off shell commands, plain Bash hooks are fine.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| filePath | string | 예 | Path to the edited file | — |
| success | boolean | 아니오 | Whether the edit was successful | — |
| agent | string | 아니오 | Agent that performed the edit | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "filePath": {
      "type": "string",
      "description": "Path to the edited file"
    },
    "success": {
      "type": "boolean",
      "description": "Whether the edit was successful"
    },
    "agent": {
      "type": "string",
      "description": "Agent that performed the edit"
    }
  },
  "required": [
    "filePath"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "hooks_post-edit",
  "arguments": {
    "filePath": "/absolute/path/my-project"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## hooks_pre-command

출처: Ruflo 원본

### 기능과 사용 시점

Assess risk before executing a command Use when native Bash hooks (via Claude Code's settings.json) are wrong because you need Ruflo-side state — pattern persistence, neural training signals, model-routing learning, cost tracking, audit chain. For one-off shell commands, plain Bash hooks are fine.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| command | string | 예 | Command to execute | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "command": {
      "type": "string",
      "description": "Command to execute"
    }
  },
  "required": [
    "command"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "hooks_pre-command",
  "arguments": {
    "command": "<command 입력>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## hooks_post-command

출처: Ruflo 원본

### 기능과 사용 시점

Record command execution outcome Use when native Bash hooks (via Claude Code's settings.json) are wrong because you need Ruflo-side state — pattern persistence, neural training signals, model-routing learning, cost tracking, audit chain. For one-off shell commands, plain Bash hooks are fine.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| command | string | 예 | Executed command | — |
| exitCode | number | 아니오 | Command exit code | — |
| success | boolean | 아니오 | Explicit execution outcome; false records a failure even without a nonzero exit code | — |
| ttl | integer | 아니오 | Command history lifetime in seconds (default: 30 days) | {"minimum":1,"maximum":2147483647} |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "command": {
      "type": "string",
      "description": "Executed command"
    },
    "exitCode": {
      "type": "number",
      "description": "Command exit code"
    },
    "success": {
      "type": "boolean",
      "description": "Explicit execution outcome; false records a failure even without a nonzero exit code"
    },
    "ttl": {
      "type": "integer",
      "minimum": 1,
      "maximum": 2147483647,
      "description": "Command history lifetime in seconds (default: 30 days)"
    }
  },
  "required": [
    "command"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "hooks_post-command",
  "arguments": {
    "command": "<command 입력>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## hooks_route

출처: Ruflo 원본

### 기능과 사용 시점

Get a 3-tier routing recommendation for a task: Tier 1 (deterministic codemod, ~0ms / $0 — for var-to-const, remove-console, add-logging), Tier 2 (Haiku — simple), Tier 3 (Sonnet/Opus — complex). Use this BEFORE spawning an agent to avoid sending simple transforms to Sonnet. Native tools have no equivalent — Claude Code does not introspect its own model-selection cost. Returns the recommended model + a `[CODEMOD_AVAILABLE]` literal when a deterministic codemod can fully apply the edit (then call hooks_codemod). Use when native Bash hooks (via Claude Code's settings.json) are wrong because you need Ruflo-side state — pattern persistence, neural training signals, model-routing learning, cost tracking, audit chain. For one-off shell commands, plain Bash hooks are fine.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| task | string | 예 | Task description | — |
| context | string | 아니오 | Additional context | — |
| useSemanticRouter | boolean | 아니오 | Use semantic similarity routing (default: true) | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "task": {
      "type": "string",
      "description": "Task description"
    },
    "context": {
      "type": "string",
      "description": "Additional context"
    },
    "useSemanticRouter": {
      "type": "boolean",
      "description": "Use semantic similarity routing (default: true)"
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
  "name": "hooks_route",
  "arguments": {
    "task": "<task 입력>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## hooks_metrics

출처: Ruflo 원본

### 기능과 사용 시점

View learning metrics dashboard Use when native Bash hooks (via Claude Code's settings.json) are wrong because you need Ruflo-side state — pattern persistence, neural training signals, model-routing learning, cost tracking, audit chain. For one-off shell commands, plain Bash hooks are fine.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| period | string | 아니오 | Metrics period (1h, 24h, 7d, 30d) | — |
| includeV3 | boolean | 아니오 | Include V3 performance metrics | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "period": {
      "type": "string",
      "description": "Metrics period (1h, 24h, 7d, 30d)"
    },
    "includeV3": {
      "type": "boolean",
      "description": "Include V3 performance metrics"
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "hooks_metrics",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## hooks_list

출처: Ruflo 원본

### 기능과 사용 시점

List all registered hooks Use when native Bash hooks (via Claude Code's settings.json) are wrong because you need Ruflo-side state — pattern persistence, neural training signals, model-routing learning, cost tracking, audit chain. For one-off shell commands, plain Bash hooks are fine.

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
  "name": "hooks_list",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## hooks_pre-task

출처: Ruflo 원본

### 기능과 사용 시점

Record task start and get agent suggestions with intelligent model routing (ADR-026) Use when native Bash hooks (via Claude Code's settings.json) are wrong because you need Ruflo-side state — pattern persistence, neural training signals, model-routing learning, cost tracking, audit chain. For one-off shell commands, plain Bash hooks are fine.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| taskId | string | 예 | Task identifier | — |
| description | string | 예 | Task description | — |
| filePath | string | 아니오 | Optional file path for AST analysis | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "taskId": {
      "type": "string",
      "description": "Task identifier"
    },
    "description": {
      "type": "string",
      "description": "Task description"
    },
    "filePath": {
      "type": "string",
      "description": "Optional file path for AST analysis"
    }
  },
  "required": [
    "taskId",
    "description"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "hooks_pre-task",
  "arguments": {
    "taskId": "<앞 단계에서 받은 ID>",
    "description": "<description 입력>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## hooks_post-task

출처: Ruflo 원본

### 기능과 사용 시점

Record task completion for learning Use when native Bash hooks (via Claude Code's settings.json) are wrong because you need Ruflo-side state — pattern persistence, neural training signals, model-routing learning, cost tracking, audit chain. For one-off shell commands, plain Bash hooks are fine.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| taskId | string | 예 | Task identifier | — |
| patterns | array | 아니오 | Learned patterns to retain; successful tasks with quality >= 0.9 may create reusable skills | {"maxItems":100} |
| success | boolean | 아니오 | Whether task was successful | — |
| agent | string | 아니오 | Agent that completed the task | — |
| quality | number | 아니오 | Quality score (0-1) | {"minimum":0,"maximum":1} |
| task | string | 아니오 | Task description text (used for learning keyword extraction) | — |
| duration | number | 아니오 | Observed task duration in milliseconds (used by pheromone-adaptive topology) | — |
| latencyBudgetMs | number | 아니오 | Latency budget used to normalize duration (default 60000ms) | — |
| consensusAlignment | number | 아니오 | Agreement with accepted swarm consensus in [0,1] (default quality) | — |
| agentRole | string | 아니오 | Role for role-local pheromone normalization (default agent) | — |
| storeDecisions | boolean | 아니오 | Also store routing decision in memory DB | — |
| parentAgentId | string | 아니오 | ID of the parent agent (from Claude Code's parent_agent_id OTel span tag / x-claude-code-parent-agent-id header). Omit for top-level work. | — |
| depth | number | 아니오 | Chain depth from root lead session (0 = lead, 1+ = subagent). Used by ADR-147 P3 depth-aware guardrail. | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "taskId": {
      "type": "string",
      "description": "Task identifier"
    },
    "patterns": {
      "type": "array",
      "items": {
        "type": "string",
        "minLength": 1,
        "maxLength": 10000
      },
      "maxItems": 100,
      "description": "Learned patterns to retain; successful tasks with quality >= 0.9 may create reusable skills"
    },
    "success": {
      "type": "boolean",
      "description": "Whether task was successful"
    },
    "agent": {
      "type": "string",
      "description": "Agent that completed the task"
    },
    "quality": {
      "type": "number",
      "minimum": 0,
      "maximum": 1,
      "description": "Quality score (0-1)"
    },
    "task": {
      "type": "string",
      "description": "Task description text (used for learning keyword extraction)"
    },
    "duration": {
      "type": "number",
      "description": "Observed task duration in milliseconds (used by pheromone-adaptive topology)"
    },
    "latencyBudgetMs": {
      "type": "number",
      "description": "Latency budget used to normalize duration (default 60000ms)"
    },
    "consensusAlignment": {
      "type": "number",
      "description": "Agreement with accepted swarm consensus in [0,1] (default quality)"
    },
    "agentRole": {
      "type": "string",
      "description": "Role for role-local pheromone normalization (default agent)"
    },
    "storeDecisions": {
      "type": "boolean",
      "description": "Also store routing decision in memory DB"
    },
    "parentAgentId": {
      "type": "string",
      "description": "ID of the parent agent (from Claude Code's parent_agent_id OTel span tag / x-claude-code-parent-agent-id header). Omit for top-level work."
    },
    "depth": {
      "type": "number",
      "description": "Chain depth from root lead session (0 = lead, 1+ = subagent). Used by ADR-147 P3 depth-aware guardrail."
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
  "name": "hooks_post-task",
  "arguments": {
    "taskId": "<앞 단계에서 받은 ID>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## hooks_explain

출처: Ruflo 원본

### 기능과 사용 시점

Explain routing decision with full transparency Use when native Bash hooks (via Claude Code's settings.json) are wrong because you need Ruflo-side state — pattern persistence, neural training signals, model-routing learning, cost tracking, audit chain. For one-off shell commands, plain Bash hooks are fine.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| task | string | 예 | Task description | — |
| agent | string | 아니오 | Specific agent to explain | — |
| verbose | boolean | 아니오 | Verbose explanation | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "task": {
      "type": "string",
      "description": "Task description"
    },
    "agent": {
      "type": "string",
      "description": "Specific agent to explain"
    },
    "verbose": {
      "type": "boolean",
      "description": "Verbose explanation"
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
  "name": "hooks_explain",
  "arguments": {
    "task": "<task 입력>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## hooks_pretrain

출처: Ruflo 원본

### 기능과 사용 시점

Analyze repository to bootstrap intelligence (4-step pipeline) Use when native Bash hooks (via Claude Code's settings.json) are wrong because you need Ruflo-side state — pattern persistence, neural training signals, model-routing learning, cost tracking, audit chain. For one-off shell commands, plain Bash hooks are fine.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| path | string | 아니오 | Repository path | — |
| depth | string | 아니오 | Analysis depth (shallow, medium, deep) | — |
| skipCache | boolean | 아니오 | Skip cached analysis | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "path": {
      "type": "string",
      "description": "Repository path"
    },
    "depth": {
      "type": "string",
      "description": "Analysis depth (shallow, medium, deep)"
    },
    "skipCache": {
      "type": "boolean",
      "description": "Skip cached analysis"
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "hooks_pretrain",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## hooks_build-agents

출처: Ruflo 원본

### 기능과 사용 시점

Generate optimized agent configurations from pretrain data Use when native Bash hooks (via Claude Code's settings.json) are wrong because you need Ruflo-side state — pattern persistence, neural training signals, model-routing learning, cost tracking, audit chain. For one-off shell commands, plain Bash hooks are fine.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| outputDir | string | 아니오 | Output directory for configs | — |
| focus | string | 아니오 | Focus area (v3-implementation, security, performance, all) | — |
| format | string | 아니오 | Config format (yaml, json) | — |
| persist | boolean | 아니오 | Write configs to disk | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "outputDir": {
      "type": "string",
      "description": "Output directory for configs"
    },
    "focus": {
      "type": "string",
      "description": "Focus area (v3-implementation, security, performance, all)"
    },
    "format": {
      "type": "string",
      "description": "Config format (yaml, json)"
    },
    "persist": {
      "type": "boolean",
      "description": "Write configs to disk"
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "hooks_build-agents",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## hooks_transfer

출처: Ruflo 원본

### 기능과 사용 시점

Transfer learned patterns from another project Use when native Bash hooks (via Claude Code's settings.json) are wrong because you need Ruflo-side state — pattern persistence, neural training signals, model-routing learning, cost tracking, audit chain. For one-off shell commands, plain Bash hooks are fine.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| sourcePath | string | 예 | Source project path | — |
| filter | string | 아니오 | Filter patterns by type | — |
| minConfidence | number | 아니오 | Minimum confidence threshold | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "sourcePath": {
      "type": "string",
      "description": "Source project path"
    },
    "filter": {
      "type": "string",
      "description": "Filter patterns by type"
    },
    "minConfidence": {
      "type": "number",
      "description": "Minimum confidence threshold"
    }
  },
  "required": [
    "sourcePath"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "hooks_transfer",
  "arguments": {
    "sourcePath": "/absolute/path/my-project"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## hooks_session-start

출처: Ruflo 원본

### 기능과 사용 시점

Initialize a new session and auto-start daemon Use when native Bash hooks (via Claude Code's settings.json) are wrong because you need Ruflo-side state — pattern persistence, neural training signals, model-routing learning, cost tracking, audit chain. For one-off shell commands, plain Bash hooks are fine.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| sessionId | string | 아니오 | Optional session ID | — |
| restoreLatest | boolean | 아니오 | Restore latest session state | — |
| startDaemon | boolean | 아니오 | Start worker daemon (default: false — opt-in to prevent unintended token usage) | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "sessionId": {
      "type": "string",
      "description": "Optional session ID"
    },
    "restoreLatest": {
      "type": "boolean",
      "description": "Restore latest session state"
    },
    "startDaemon": {
      "type": "boolean",
      "description": "Start worker daemon (default: false — opt-in to prevent unintended token usage)"
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "hooks_session-start",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## hooks_session-end

출처: Ruflo 원본

### 기능과 사용 시점

End current session, stop daemon, and persist state Use when native Bash hooks (via Claude Code's settings.json) are wrong because you need Ruflo-side state — pattern persistence, neural training signals, model-routing learning, cost tracking, audit chain. For one-off shell commands, plain Bash hooks are fine.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| saveState | boolean | 아니오 | Save session state | — |
| exportMetrics | boolean | 아니오 | Export session metrics | — |
| stopDaemon | boolean | 아니오 | Stop worker daemon (default: true) | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "saveState": {
      "type": "boolean",
      "description": "Save session state"
    },
    "exportMetrics": {
      "type": "boolean",
      "description": "Export session metrics"
    },
    "stopDaemon": {
      "type": "boolean",
      "description": "Stop worker daemon (default: true)"
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "hooks_session-end",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## hooks_session-restore

출처: Ruflo 원본

### 기능과 사용 시점

Restore a previous session Use when native Bash hooks (via Claude Code's settings.json) are wrong because you need Ruflo-side state — pattern persistence, neural training signals, model-routing learning, cost tracking, audit chain. For one-off shell commands, plain Bash hooks are fine.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| sessionId | string | 아니오 | Session ID to restore (or "latest") | — |
| restoreAgents | boolean | 아니오 | Restore spawned agents | — |
| restoreTasks | boolean | 아니오 | Restore active tasks | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "sessionId": {
      "type": "string",
      "description": "Session ID to restore (or \"latest\")"
    },
    "restoreAgents": {
      "type": "boolean",
      "description": "Restore spawned agents"
    },
    "restoreTasks": {
      "type": "boolean",
      "description": "Restore active tasks"
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "hooks_session-restore",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## hooks_notify

출처: Ruflo 원본

### 기능과 사용 시점

Send cross-agent notification Use when native Bash hooks (via Claude Code's settings.json) are wrong because you need Ruflo-side state — pattern persistence, neural training signals, model-routing learning, cost tracking, audit chain. For one-off shell commands, plain Bash hooks are fine.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| message | string | 예 | Notification message | — |
| target | string | 아니오 | Target agent or "all" | — |
| priority | string | 아니오 | Priority level (low, normal, high, urgent) | — |
| data | object | 아니오 | Additional data payload | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "message": {
      "type": "string",
      "description": "Notification message"
    },
    "target": {
      "type": "string",
      "description": "Target agent or \"all\""
    },
    "priority": {
      "type": "string",
      "description": "Priority level (low, normal, high, urgent)"
    },
    "data": {
      "type": "object",
      "description": "Additional data payload"
    }
  },
  "required": [
    "message"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "hooks_notify",
  "arguments": {
    "message": "<message 입력>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## hooks_init

출처: Ruflo 원본

### 기능과 사용 시점

Initialize hooks in project with .claude/settings.json Use when native Bash hooks (via Claude Code's settings.json) are wrong because you need Ruflo-side state — pattern persistence, neural training signals, model-routing learning, cost tracking, audit chain. For one-off shell commands, plain Bash hooks are fine.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| path | string | 아니오 | Project path | — |
| template | string | 아니오 | Template to use (minimal, standard, full) | — |
| force | boolean | 아니오 | Overwrite existing configuration | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "path": {
      "type": "string",
      "description": "Project path"
    },
    "template": {
      "type": "string",
      "description": "Template to use (minimal, standard, full)"
    },
    "force": {
      "type": "boolean",
      "description": "Overwrite existing configuration"
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "hooks_init",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## hooks_intelligence

출처: Ruflo 원본

### 기능과 사용 시점

RuVector intelligence system status (shows REAL metrics from memory store) Use when native Bash hooks (via Claude Code's settings.json) are wrong because you need Ruflo-side state — pattern persistence, neural training signals, model-routing learning, cost tracking, audit chain. For one-off shell commands, plain Bash hooks are fine.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| mode | string | 아니오 | Intelligence mode | — |
| enableSona | boolean | 아니오 | Enable SONA learning | — |
| enableMoe | boolean | 아니오 | Enable MoE routing | — |
| enableHnsw | boolean | 아니오 | Enable HNSW search | — |
| forceTraining | boolean | 아니오 | Force training cycle | — |
| showStatus | boolean | 아니오 | Show status only | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "mode": {
      "type": "string",
      "description": "Intelligence mode"
    },
    "enableSona": {
      "type": "boolean",
      "description": "Enable SONA learning"
    },
    "enableMoe": {
      "type": "boolean",
      "description": "Enable MoE routing"
    },
    "enableHnsw": {
      "type": "boolean",
      "description": "Enable HNSW search"
    },
    "forceTraining": {
      "type": "boolean",
      "description": "Force training cycle"
    },
    "showStatus": {
      "type": "boolean",
      "description": "Show status only"
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "hooks_intelligence",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## hooks_intelligence-reset

출처: Ruflo 원본

### 기능과 사용 시점

Reset intelligence learning state Use when native Bash hooks (via Claude Code's settings.json) are wrong because you need Ruflo-side state — pattern persistence, neural training signals, model-routing learning, cost tracking, audit chain. For one-off shell commands, plain Bash hooks are fine.

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
  "name": "hooks_intelligence-reset",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## hooks_intelligence_trajectory-start

출처: Ruflo 원본

### 기능과 사용 시점

Begin SONA trajectory for reinforcement learning Use when native Bash hooks (via Claude Code's settings.json) are wrong because you need Ruflo-side state — pattern persistence, neural training signals, model-routing learning, cost tracking, audit chain. For one-off shell commands, plain Bash hooks are fine.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| task | string | 예 | Task description | — |
| agent | string | 아니오 | Agent type | — |
| sessionId | string | 아니오 | Session id for the execution-state tree (default: CLAUDE_FLOW_SESSION_ID or "default") | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "task": {
      "type": "string",
      "description": "Task description"
    },
    "agent": {
      "type": "string",
      "description": "Agent type"
    },
    "sessionId": {
      "type": "string",
      "description": "Session id for the execution-state tree (default: CLAUDE_FLOW_SESSION_ID or \"default\")"
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
  "name": "hooks_intelligence_trajectory-start",
  "arguments": {
    "task": "<task 입력>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## hooks_intelligence_trajectory-step

출처: Ruflo 원본

### 기능과 사용 시점

Record step in trajectory for reinforcement learning Use when native Bash hooks (via Claude Code's settings.json) are wrong because you need Ruflo-side state — pattern persistence, neural training signals, model-routing learning, cost tracking, audit chain. For one-off shell commands, plain Bash hooks are fine.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| trajectoryId | string | 예 | Trajectory ID | — |
| action | string | 예 | Action taken | — |
| result | string | 아니오 | Action result | — |
| quality | number | 아니오 | Quality score (0-1) | {"minimum":0,"maximum":1} |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "trajectoryId": {
      "type": "string",
      "description": "Trajectory ID"
    },
    "action": {
      "type": "string",
      "description": "Action taken"
    },
    "result": {
      "type": "string",
      "description": "Action result"
    },
    "quality": {
      "type": "number",
      "minimum": 0,
      "maximum": 1,
      "description": "Quality score (0-1)"
    }
  },
  "required": [
    "trajectoryId",
    "action"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "hooks_intelligence_trajectory-step",
  "arguments": {
    "trajectoryId": "<앞 단계에서 받은 ID>",
    "action": "<action 입력>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## hooks_intelligence_trajectory-end

출처: Ruflo 원본

### 기능과 사용 시점

End trajectory and trigger SONA learning with EWC++ Use when native Bash hooks (via Claude Code's settings.json) are wrong because you need Ruflo-side state — pattern persistence, neural training signals, model-routing learning, cost tracking, audit chain. For one-off shell commands, plain Bash hooks are fine.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| trajectoryId | string | 예 | Trajectory ID | — |
| success | boolean | 아니오 | Overall success | — |
| feedback | string | 아니오 | Optional feedback | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "trajectoryId": {
      "type": "string",
      "description": "Trajectory ID"
    },
    "success": {
      "type": "boolean",
      "description": "Overall success"
    },
    "feedback": {
      "type": "string",
      "description": "Optional feedback"
    }
  },
  "required": [
    "trajectoryId"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "hooks_intelligence_trajectory-end",
  "arguments": {
    "trajectoryId": "<앞 단계에서 받은 ID>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## hooks_intelligence_pattern-store

출처: Ruflo 원본

### 기능과 사용 시점

Store pattern in ReasoningBank (HNSW-indexed) Use when native Bash hooks (via Claude Code's settings.json) are wrong because you need Ruflo-side state — pattern persistence, neural training signals, model-routing learning, cost tracking, audit chain. For one-off shell commands, plain Bash hooks are fine.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| pattern | string | 예 | Pattern description | — |
| type | string | 아니오 | Pattern type | — |
| confidence | number | 아니오 | Confidence score | — |
| metadata | object | 아니오 | Additional metadata | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "pattern": {
      "type": "string",
      "description": "Pattern description"
    },
    "type": {
      "type": "string",
      "description": "Pattern type"
    },
    "confidence": {
      "type": "number",
      "description": "Confidence score"
    },
    "metadata": {
      "type": "object",
      "description": "Additional metadata"
    }
  },
  "required": [
    "pattern"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "hooks_intelligence_pattern-store",
  "arguments": {
    "pattern": "<pattern 입력>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## hooks_intelligence_pattern-search

출처: Ruflo 원본

### 기능과 사용 시점

Search patterns using REAL vector search (HNSW when available, brute-force fallback) Use when native Bash hooks (via Claude Code's settings.json) are wrong because you need Ruflo-side state — pattern persistence, neural training signals, model-routing learning, cost tracking, audit chain. For one-off shell commands, plain Bash hooks are fine.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| query | string | 예 | Search query | — |
| topK | number | 아니오 | Number of results | — |
| minConfidence | number | 아니오 | Minimum similarity threshold (0-1) | — |
| namespace | string | 아니오 | Namespace to search (default: pattern) | — |
| strategy | string | 아니오 | Retrieval strategy. Default "semantic" (unchanged behavior). "state-tree" returns the MAGE-style root→current execution-state path for a session instead of embedding search (prototype). | {"enum":["semantic","state-tree"]} |
| sessionId | string | 아니오 | Session id for strategy="state-tree" (default: CLAUDE_FLOW_SESSION_ID or "default") | — |
| depth | number | 아니오 | For strategy="state-tree": max path nodes returned, counted from the current node upward | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "query": {
      "type": "string",
      "description": "Search query"
    },
    "topK": {
      "type": "number",
      "description": "Number of results"
    },
    "minConfidence": {
      "type": "number",
      "description": "Minimum similarity threshold (0-1)"
    },
    "namespace": {
      "type": "string",
      "description": "Namespace to search (default: pattern)"
    },
    "strategy": {
      "type": "string",
      "enum": [
        "semantic",
        "state-tree"
      ],
      "description": "Retrieval strategy. Default \"semantic\" (unchanged behavior). \"state-tree\" returns the MAGE-style root→current execution-state path for a session instead of embedding search (prototype)."
    },
    "sessionId": {
      "type": "string",
      "description": "Session id for strategy=\"state-tree\" (default: CLAUDE_FLOW_SESSION_ID or \"default\")"
    },
    "depth": {
      "type": "number",
      "description": "For strategy=\"state-tree\": max path nodes returned, counted from the current node upward"
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
  "name": "hooks_intelligence_pattern-search",
  "arguments": {
    "query": "<query 입력>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## hooks_intelligence_stats

출처: Ruflo 원본

### 기능과 사용 시점

Get RuVector intelligence layer statistics Use when native Bash hooks (via Claude Code's settings.json) are wrong because you need Ruflo-side state — pattern persistence, neural training signals, model-routing learning, cost tracking, audit chain. For one-off shell commands, plain Bash hooks are fine.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| detailed | boolean | 아니오 | Include detailed stats | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "detailed": {
      "type": "boolean",
      "description": "Include detailed stats"
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "hooks_intelligence_stats",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## hooks_intelligence_learn

출처: Ruflo 원본

### 기능과 사용 시점

Force immediate SONA learning cycle with EWC++ consolidation Use when native Bash hooks (via Claude Code's settings.json) are wrong because you need Ruflo-side state — pattern persistence, neural training signals, model-routing learning, cost tracking, audit chain. For one-off shell commands, plain Bash hooks are fine.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| trajectoryIds | array | 아니오 | Specific trajectories to learn from | — |
| consolidate | boolean | 아니오 | Run EWC++ consolidation | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "trajectoryIds": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Specific trajectories to learn from"
    },
    "consolidate": {
      "type": "boolean",
      "description": "Run EWC++ consolidation"
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "hooks_intelligence_learn",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## hooks_intelligence_attention

출처: Ruflo 원본

### 기능과 사용 시점

Compute attention-weighted similarity using MoE/Flash/Hyperbolic Use when native Bash hooks (via Claude Code's settings.json) are wrong because you need Ruflo-side state — pattern persistence, neural training signals, model-routing learning, cost tracking, audit chain. For one-off shell commands, plain Bash hooks are fine.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| query | string | 예 | Query for attention computation | — |
| mode | string | 아니오 | Attention mode (flash, moe, hyperbolic) | — |
| topK | number | 아니오 | Top-k results | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "query": {
      "type": "string",
      "description": "Query for attention computation"
    },
    "mode": {
      "type": "string",
      "description": "Attention mode (flash, moe, hyperbolic)"
    },
    "topK": {
      "type": "number",
      "description": "Top-k results"
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
  "name": "hooks_intelligence_attention",
  "arguments": {
    "query": "<query 입력>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## hooks_worker-list

출처: Ruflo 원본

### 기능과 사용 시점

List all 12 background workers with status and capabilities Use when native Bash hooks (via Claude Code's settings.json) are wrong because you need Ruflo-side state — pattern persistence, neural training signals, model-routing learning, cost tracking, audit chain. For one-off shell commands, plain Bash hooks are fine.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| status | string | 아니오 | Filter by status (all, running, completed, pending) | — |
| includeActive | boolean | 아니오 | Include active worker instances | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "status": {
      "type": "string",
      "description": "Filter by status (all, running, completed, pending)"
    },
    "includeActive": {
      "type": "boolean",
      "description": "Include active worker instances"
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "hooks_worker-list",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## hooks_worker-dispatch

출처: Ruflo 원본

### 기능과 사용 시점

Dispatch a background worker for analysis/optimization tasks Use when native Bash hooks (via Claude Code's settings.json) are wrong because you need Ruflo-side state — pattern persistence, neural training signals, model-routing learning, cost tracking, audit chain. For one-off shell commands, plain Bash hooks are fine.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| trigger | string | 예 | Worker trigger type | {"enum":["ultralearn","optimize","consolidate","predict","audit","map","preload","deepdive","document","refactor","benchmark","testgaps"]} |
| context | string | 아니오 | Context for the worker (file path, topic, etc.) | — |
| priority | string | 아니오 | Priority (low, normal, high, critical) | — |
| background | boolean | 아니오 | Run in background (non-blocking) | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "trigger": {
      "type": "string",
      "description": "Worker trigger type",
      "enum": [
        "ultralearn",
        "optimize",
        "consolidate",
        "predict",
        "audit",
        "map",
        "preload",
        "deepdive",
        "document",
        "refactor",
        "benchmark",
        "testgaps"
      ]
    },
    "context": {
      "type": "string",
      "description": "Context for the worker (file path, topic, etc.)"
    },
    "priority": {
      "type": "string",
      "description": "Priority (low, normal, high, critical)"
    },
    "background": {
      "type": "boolean",
      "description": "Run in background (non-blocking)"
    }
  },
  "required": [
    "trigger"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "hooks_worker-dispatch",
  "arguments": {
    "trigger": "ultralearn"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## hooks_worker-status

출처: Ruflo 원본

### 기능과 사용 시점

Get status of a specific worker or all active workers Use when native Bash hooks (via Claude Code's settings.json) are wrong because you need Ruflo-side state — pattern persistence, neural training signals, model-routing learning, cost tracking, audit chain. For one-off shell commands, plain Bash hooks are fine.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| workerId | string | 아니오 | Specific worker ID to check | — |
| includeCompleted | boolean | 아니오 | Include completed workers | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "workerId": {
      "type": "string",
      "description": "Specific worker ID to check"
    },
    "includeCompleted": {
      "type": "boolean",
      "description": "Include completed workers"
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "hooks_worker-status",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## hooks_worker-detect

출처: Ruflo 원본

### 기능과 사용 시점

Detect worker triggers from user prompt (for UserPromptSubmit hook) Use when native Bash hooks (via Claude Code's settings.json) are wrong because you need Ruflo-side state — pattern persistence, neural training signals, model-routing learning, cost tracking, audit chain. For one-off shell commands, plain Bash hooks are fine.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| prompt | string | 예 | User prompt to analyze | — |
| autoDispatch | boolean | 아니오 | Automatically dispatch detected workers | — |
| minConfidence | number | 아니오 | Minimum confidence threshold (0-1) | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "prompt": {
      "type": "string",
      "description": "User prompt to analyze"
    },
    "autoDispatch": {
      "type": "boolean",
      "description": "Automatically dispatch detected workers"
    },
    "minConfidence": {
      "type": "number",
      "description": "Minimum confidence threshold (0-1)"
    }
  },
  "required": [
    "prompt"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "hooks_worker-detect",
  "arguments": {
    "prompt": "<prompt 입력>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## hooks_worker-cancel

출처: Ruflo 원본

### 기능과 사용 시점

Cancel a running worker Use when native Bash hooks (via Claude Code's settings.json) are wrong because you need Ruflo-side state — pattern persistence, neural training signals, model-routing learning, cost tracking, audit chain. For one-off shell commands, plain Bash hooks are fine.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| workerId | string | 예 | Worker ID to cancel | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "workerId": {
      "type": "string",
      "description": "Worker ID to cancel"
    }
  },
  "required": [
    "workerId"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "hooks_worker-cancel",
  "arguments": {
    "workerId": "<앞 단계에서 받은 ID>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## hooks_model-route

출처: Ruflo 원본

### 기능과 사용 시점

Route task to optimal Claude model (haiku/sonnet/opus) based on complexity Use when native Bash hooks (via Claude Code's settings.json) are wrong because you need Ruflo-side state — pattern persistence, neural training signals, model-routing learning, cost tracking, audit chain. For one-off shell commands, plain Bash hooks are fine.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| task | string | 예 | Task description to analyze | — |
| preferSpeed | boolean | 아니오 | Prefer faster models when possible | — |
| preferCost | boolean | 아니오 | Prefer cheaper models when possible | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "task": {
      "type": "string",
      "description": "Task description to analyze"
    },
    "preferSpeed": {
      "type": "boolean",
      "description": "Prefer faster models when possible"
    },
    "preferCost": {
      "type": "boolean",
      "description": "Prefer cheaper models when possible"
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
  "name": "hooks_model-route",
  "arguments": {
    "task": "<task 입력>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## hooks_model-outcome

출처: Ruflo 원본

### 기능과 사용 시점

Record model routing outcome for learning Use when native Bash hooks (via Claude Code's settings.json) are wrong because you need Ruflo-side state — pattern persistence, neural training signals, model-routing learning, cost tracking, audit chain. For one-off shell commands, plain Bash hooks are fine.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| task | string | 예 | Original task | — |
| model | string | 예 | Model used | {"enum":["haiku","sonnet","opus"]} |
| outcome | string | 예 | Task outcome | {"enum":["success","failure","escalated"]} |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "task": {
      "type": "string",
      "description": "Original task"
    },
    "model": {
      "type": "string",
      "enum": [
        "haiku",
        "sonnet",
        "opus"
      ],
      "description": "Model used"
    },
    "outcome": {
      "type": "string",
      "enum": [
        "success",
        "failure",
        "escalated"
      ],
      "description": "Task outcome"
    }
  },
  "required": [
    "task",
    "model",
    "outcome"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "hooks_model-outcome",
  "arguments": {
    "task": "<task 입력>",
    "model": "haiku",
    "outcome": "success"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## hooks_model-stats

출처: Ruflo 원본

### 기능과 사용 시점

Get model routing statistics Use when native Bash hooks (via Claude Code's settings.json) are wrong because you need Ruflo-side state — pattern persistence, neural training signals, model-routing learning, cost tracking, audit chain. For one-off shell commands, plain Bash hooks are fine.

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
  "name": "hooks_model-stats",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## hooks_model-verify

출처: Ruflo 원본

### 기능과 사용 시점

Verify a generated output with CHEAP structural signals ($0, no LLM call) and get an escalation verdict — the post-generation half of confidence-gated tier routing (route → generate → verify → escalate on failure). Checks: empty/truncated output, refusal patterns, degenerate repetition, and real syntax parsing for code/JSON tasks (TypeScript compiler / JSON.parse). Returns {confident, reasons[], suggestedTier, suggestedModel, escalate}. By default the verdict is recorded into the model-routing learning stream (success when confident, escalated when not) so the bandit learns which task shapes the cheap tier fails on. Use when you just generated with the tier hooks_model-route picked and must decide accept-vs-escalate BEFORE acting on the output; accepting cheap-tier output unverified is wrong because structurally unusable results (refusals, truncation, unparseable code) silently propagate downstream, and pre-generation routing alone cannot catch them. Not a semantic-quality judge — it only catches structurally unusable outputs.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| task | string | 예 | The task the output was generated for | — |
| output | string | 예 | The generated output to verify | — |
| model | string | 아니오 | Model that produced the output (drives the escalation ladder; default haiku) | {"enum":["haiku","sonnet","opus"]} |
| tierUsed | number | 아니오 | Tier that produced the output; derived from model when absent | {"enum":[1,2,3]} |
| taskKind | string | 아니오 | Force the task kind; default auto-detect | {"enum":["code","json","text","auto"]} |
| record | boolean | 아니오 | Record the verdict into the routing learning stream (default true; requires model) | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "task": {
      "type": "string",
      "description": "The task the output was generated for"
    },
    "output": {
      "type": "string",
      "description": "The generated output to verify"
    },
    "model": {
      "type": "string",
      "enum": [
        "haiku",
        "sonnet",
        "opus"
      ],
      "description": "Model that produced the output (drives the escalation ladder; default haiku)"
    },
    "tierUsed": {
      "type": "number",
      "enum": [
        1,
        2,
        3
      ],
      "description": "Tier that produced the output; derived from model when absent"
    },
    "taskKind": {
      "type": "string",
      "enum": [
        "code",
        "json",
        "text",
        "auto"
      ],
      "description": "Force the task kind; default auto-detect"
    },
    "record": {
      "type": "boolean",
      "description": "Record the verdict into the routing learning stream (default true; requires model)"
    }
  },
  "required": [
    "task",
    "output"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "hooks_model-verify",
  "arguments": {
    "task": "<task 입력>",
    "output": "<output 입력>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## hooks_codemod

출처: Ruflo 원본

### 기능과 사용 시점

Apply a deterministic, $0 (no-LLM) code transform — the real Tier-1 execution path (ADR-143). Supported intents: var-to-const, remove-console, add-logging. Uses the TypeScript compiler with formatting-preserving edits (comments/whitespace survive). Targets: raw `code` (returns transformed text, writes nothing) | a single `file` | a `files` array | a `glob` pattern (batch — applies the intent across every match in one $0 call). Files are rewritten in place unless `dryRun`. Intents that need reasoning — add-types, add-error-handling, async-await — are NOT supported here; route those to a model via hooks_model-route. Use when hooks_pre-task / hooks_route returned [CODEMOD_AVAILABLE].

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| intent | string | 예 | Deterministic codemod to apply | {"enum":["var-to-const","remove-console","add-logging"]} |
| file | string | 아니오 | Path to a single existing source file to transform in place | — |
| files | array | 아니오 | Multiple file paths to transform in one batch call | — |
| glob | string | 아니오 | Glob pattern (relative to project root, e.g. "src/**/*.ts") — applies the intent to every matching source file | — |
| code | string | 아니오 | Raw source to transform instead of files (returns transformed code, writes nothing) | — |
| language | string | 아니오 | Language hint for raw code (default typescript; inferred from extension for files) | {"enum":["javascript","typescript","jsx","tsx"]} |
| dryRun | boolean | 아니오 | Report what would change without writing files | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "intent": {
      "type": "string",
      "enum": [
        "var-to-const",
        "remove-console",
        "add-logging"
      ],
      "description": "Deterministic codemod to apply"
    },
    "file": {
      "type": "string",
      "description": "Path to a single existing source file to transform in place"
    },
    "files": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Multiple file paths to transform in one batch call"
    },
    "glob": {
      "type": "string",
      "description": "Glob pattern (relative to project root, e.g. \"src/**/*.ts\") — applies the intent to every matching source file"
    },
    "code": {
      "type": "string",
      "description": "Raw source to transform instead of files (returns transformed code, writes nothing)"
    },
    "language": {
      "type": "string",
      "enum": [
        "javascript",
        "typescript",
        "jsx",
        "tsx"
      ],
      "description": "Language hint for raw code (default typescript; inferred from extension for files)"
    },
    "dryRun": {
      "type": "boolean",
      "description": "Report what would change without writing files"
    }
  },
  "required": [
    "intent"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "hooks_codemod",
  "arguments": {
    "intent": "var-to-const"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## hooks_coverage-route

출처: Ruflo 원본

### 기능과 사용 시점

Route task to agents based on test coverage gaps (ruvector integration)

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| task | string | 예 | Task description to route | — |
| projectRoot | string | 아니오 | Project root directory (defaults to cwd) | — |
| threshold | number | 아니오 | Coverage threshold percentage (default: 80) | — |
| useRuvector | boolean | 아니오 | Use ruvector integration if available (default: true) | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "task": {
      "type": "string",
      "description": "Task description to route"
    },
    "projectRoot": {
      "type": "string",
      "description": "Project root directory (defaults to cwd)"
    },
    "threshold": {
      "type": "number",
      "description": "Coverage threshold percentage (default: 80)"
    },
    "useRuvector": {
      "type": "boolean",
      "description": "Use ruvector integration if available (default: true)"
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
  "name": "hooks_coverage-route",
  "arguments": {
    "task": "<task 입력>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## hooks_coverage-suggest

출처: Ruflo 원본

### 기능과 사용 시점

Suggest coverage improvements for a path (ruvector integration)

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| path | string | 예 | Path to analyze for coverage suggestions | — |
| projectRoot | string | 아니오 | Project root directory (defaults to cwd) | — |
| threshold | number | 아니오 | Coverage threshold percentage (default: 80) | — |
| limit | number | 아니오 | Maximum number of suggestions to return (default: 20) | — |
| useRuvector | boolean | 아니오 | Use ruvector integration if available (default: true) | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "path": {
      "type": "string",
      "description": "Path to analyze for coverage suggestions"
    },
    "projectRoot": {
      "type": "string",
      "description": "Project root directory (defaults to cwd)"
    },
    "threshold": {
      "type": "number",
      "description": "Coverage threshold percentage (default: 80)"
    },
    "limit": {
      "type": "number",
      "description": "Maximum number of suggestions to return (default: 20)"
    },
    "useRuvector": {
      "type": "boolean",
      "description": "Use ruvector integration if available (default: true)"
    }
  },
  "required": [
    "path"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "hooks_coverage-suggest",
  "arguments": {
    "path": "/absolute/path/my-project"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## hooks_coverage-gaps

출처: Ruflo 원본

### 기능과 사용 시점

List all coverage gaps with priority scoring and agent assignments

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| projectRoot | string | 아니오 | Project root directory (defaults to cwd) | — |
| threshold | number | 아니오 | Coverage threshold percentage (default: 80) | — |
| groupByAgent | boolean | 아니오 | Group gaps by suggested agent (default: true) | — |
| useRuvector | boolean | 아니오 | Use ruvector integration if available (default: true) | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "projectRoot": {
      "type": "string",
      "description": "Project root directory (defaults to cwd)"
    },
    "threshold": {
      "type": "number",
      "description": "Coverage threshold percentage (default: 80)"
    },
    "groupByAgent": {
      "type": "boolean",
      "description": "Group gaps by suggested agent (default: true)"
    },
    "useRuvector": {
      "type": "boolean",
      "description": "Use ruvector integration if available (default: true)"
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "hooks_coverage-gaps",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.
