# 에이전트 생성·실행·수명 관리

[전체 목차](../MANUAL.md) · [사용 순서](../WORKFLOWS.md)

- [agent_spawn](#agent_spawn)
- [agent_execute](#agent_execute)
- [agent_terminate](#agent_terminate)
- [agent_status](#agent_status)
- [agent_list](#agent_list)
- [agent_pool](#agent_pool)
- [agent_health](#agent_health)
- [agent_update](#agent_update)
- [agent_logs](#agent_logs)

## agent_spawn

출처: Ruflo 원본

### 기능과 사용 시점

Spawn a Ruflo-tracked agent with cost attribution + memory persistence + swarm coordination. Use when native Task tool is wrong because you need (a) cost tracking per agent in the cost-tracking namespace, (b) cross-session learning via the patterns namespace, or (c) coordination with other agents in a swarm topology (hierarchical / mesh / consensus). For one-shot subtasks with no learning loop, native Task is fine. Pair with hooks_route to pick the right model first.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| agentType | string | 예 | Type of agent to spawn | — |
| agentId | string | 아니오 | Optional custom agent ID | — |
| swarmId | string | 아니오 | Optional swarm to register the agent with (defaults to most-recent swarm) | — |
| config | object | 아니오 | Agent configuration | — |
| domain | string | 아니오 | Agent domain | — |
| model | string | 아니오 | Claude model alias (haiku=fast/cheap, sonnet=balanced, opus=current Opus 4.8, opus-4.7=prior Opus pin) | {"enum":["haiku","sonnet","opus","opus-4.7","inherit"]} |
| task | string | 아니오 | Task description for intelligent model routing | — |
| memoryBase | string | 아니오 | Opt-in: base .rvf memory file to fork a per-agent Copy-On-Write branch from (agenticow). When set, the agent gets an isolated ~162-byte COW branch instead of a full copy — promote on success, discard on terminate. Requires the optional `agenticow` dep; degrades to a no-op when absent or when CLAUDE_FLOW_NO_COW_MEMORY=1. | — |
| memoryDimension | integer | 아니오 | Vector dimension for the COW base (required only when memoryBase does not exist yet) | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "agentType": {
      "type": "string",
      "description": "Type of agent to spawn"
    },
    "agentId": {
      "type": "string",
      "description": "Optional custom agent ID"
    },
    "swarmId": {
      "type": "string",
      "description": "Optional swarm to register the agent with (defaults to most-recent swarm)"
    },
    "config": {
      "type": "object",
      "description": "Agent configuration"
    },
    "domain": {
      "type": "string",
      "description": "Agent domain"
    },
    "model": {
      "type": "string",
      "enum": [
        "haiku",
        "sonnet",
        "opus",
        "opus-4.7",
        "inherit"
      ],
      "description": "Claude model alias (haiku=fast/cheap, sonnet=balanced, opus=current Opus 4.8, opus-4.7=prior Opus pin)"
    },
    "task": {
      "type": "string",
      "description": "Task description for intelligent model routing"
    },
    "memoryBase": {
      "type": "string",
      "description": "Opt-in: base .rvf memory file to fork a per-agent Copy-On-Write branch from (agenticow). When set, the agent gets an isolated ~162-byte COW branch instead of a full copy — promote on success, discard on terminate. Requires the optional `agenticow` dep; degrades to a no-op when absent or when CLAUDE_FLOW_NO_COW_MEMORY=1."
    },
    "memoryDimension": {
      "type": "integer",
      "description": "Vector dimension for the COW base (required only when memoryBase does not exist yet)"
    }
  },
  "required": [
    "agentType"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "agent_spawn",
  "arguments": {
    "agentType": "<agentType 입력>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## agent_execute

출처: Ruflo 원본

### 기능과 사용 시점

Run a task on a previously-spawned agent_spawn record via the Anthropic Messages API with that agent's configured model. Use when native Task tool is wrong because (a) you need the spawned agent's persistent config (model, instructions, cost-tracking attribution) to apply to this turn, (b) the result needs to feed back into the agent's lifecycle (taskCount, lastResult, swarm-coordinated state), or (c) you want explicit model routing via the spawn record's `model` field instead of inheriting. For one-shot Claude prompts without a tracked agent, native Task is fine. Requires ANTHROPIC_API_KEY in env.

### 연결·실행 조건

Bongee의 공통 모델 호출은 기본 Codex 로그인 세션을 사용합니다. 원본 설명에 남은 ANTHROPIC_API_KEY 요건은 원본 API 경로에 해당합니다. model/maxTokens/temperature 설정이 CLI 세션에서 원본 API와 완전히 같은 의미로 적용된다고 보장하지 않습니다.

스키마·원본 설명에 계정/토큰 요건이 있습니다. 예시의 자리표시자를 실제 값으로 바꾸되 저장소에 커밋하지 마세요. AI 공급자 키와 서비스 접근 권한은 별개입니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| agentId | string | 예 | ID of the spawned agent | — |
| prompt | string | 예 | Task / prompt for the agent to execute | — |
| systemPrompt | string | 아니오 | Optional system prompt (overrides agent default) | — |
| maxTokens | number | 아니오 | Max output tokens (default 1024) | — |
| temperature | number | 아니오 | Sampling temperature 0..1 (default 0.7) | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "agentId": {
      "type": "string",
      "description": "ID of the spawned agent"
    },
    "prompt": {
      "type": "string",
      "description": "Task / prompt for the agent to execute"
    },
    "systemPrompt": {
      "type": "string",
      "description": "Optional system prompt (overrides agent default)"
    },
    "maxTokens": {
      "type": "number",
      "description": "Max output tokens (default 1024)"
    },
    "temperature": {
      "type": "number",
      "description": "Sampling temperature 0..1 (default 0.7)"
    }
  },
  "required": [
    "agentId",
    "prompt"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "agent_execute",
  "arguments": {
    "agentId": "<앞 단계에서 받은 ID>",
    "prompt": "<prompt 입력>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## agent_terminate

출처: Ruflo 원본

### 기능과 사용 시점

Remove a Ruflo-tracked agent from the registry and free its swarm slot. Use when you need to (a) clean up a spawned agent so its cost-tracking row finalizes, (b) reclaim a swarm-topology slot for another agent, or (c) end a stuck agent without restarting the whole swarm. For one-shot Task tool invocations that already self-terminate, this tool is not needed. Pair with agent_list first to confirm the agentId.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| agentId | string | 예 | ID of agent to terminate | — |
| force | boolean | 아니오 | Force immediate termination | — |
| promoteMemory | boolean | 아니오 | When the agent has a per-agent COW memory branch (spawned with memoryBase), promote (merge) its edits into the shared base on terminate. Default false → discard the branch (throw its edits away). No-op when the agent has no branch. | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "agentId": {
      "type": "string",
      "description": "ID of agent to terminate"
    },
    "force": {
      "type": "boolean",
      "description": "Force immediate termination"
    },
    "promoteMemory": {
      "type": "boolean",
      "description": "When the agent has a per-agent COW memory branch (spawned with memoryBase), promote (merge) its edits into the shared base on terminate. Default false → discard the branch (throw its edits away). No-op when the agent has no branch."
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
  "name": "agent_terminate",
  "arguments": {
    "agentId": "<앞 단계에서 받은 ID>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## agent_status

출처: Ruflo 원본

### 기능과 사용 시점

Read the lifecycle state of a single tracked agent: idle/running/stopped, current taskCount, lastResult, model, health score. Use when native Task tool is wrong because you need agent-level state (status across turns, accumulated taskCount, last error, swarm coordination) rather than a one-shot response. For inspecting a Task you just ran, native Task output is fine. Pair with agent_list to find the agentId first.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| agentId | string | 예 | ID of agent | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "agentId": {
      "type": "string",
      "description": "ID of agent"
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
  "name": "agent_status",
  "arguments": {
    "agentId": "<앞 단계에서 받은 ID>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## agent_list

출처: Ruflo 원본

### 기능과 사용 시점

List every Ruflo-tracked agent in the registry with its type, model, status, and taskCount. Use when native Task tool is wrong because you need to see the swarm-wide agent inventory across turns (which agents exist, their roles, their cost-tracking handles) rather than spawn a new one-shot Task. Filter by status/domain/agentType if needed. For starting a fresh single-shot subagent, native Task is fine.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| status | string | 아니오 | Filter by status | — |
| domain | string | 아니오 | Filter by domain | — |
| includeTerminated | boolean | 아니오 | Include terminated agents | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "status": {
      "type": "string",
      "description": "Filter by status"
    },
    "domain": {
      "type": "string",
      "description": "Filter by domain"
    },
    "includeTerminated": {
      "type": "boolean",
      "description": "Include terminated agents"
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "agent_list",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## agent_pool

출처: Ruflo 원본

### 기능과 사용 시점

Manage a fixed-size warm pool of pre-spawned agents to skip cold-start cost on bursty workloads. Use when native Task is wrong because (a) you have a queue of similar tasks and want to amortize spawn latency, (b) cost-tracking wants stable agentIds across requests, or (c) swarm topology requires a known agent count at all times. For one-shot work, just call agent_spawn or native Task. Pool sizes and warm/idle thresholds are set per-pool.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| action | string | 예 | Pool action | {"enum":["status","scale","drain","fill"]} |
| targetSize | number | 아니오 | Target pool size (for scale action) | — |
| agentType | string | 아니오 | Agent type filter | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "action": {
      "type": "string",
      "enum": [
        "status",
        "scale",
        "drain",
        "fill"
      ],
      "description": "Pool action"
    },
    "targetSize": {
      "type": "number",
      "description": "Target pool size (for scale action)"
    },
    "agentType": {
      "type": "string",
      "description": "Agent type filter"
    }
  },
  "required": [
    "action"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "agent_pool",
  "arguments": {
    "action": "status"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## agent_health

출처: Ruflo 원본

### 기능과 사용 시점

Compute an agent's rolling health score (0-1) from recent task success ratio + response-latency p50/p95 + error rate. Use when native Task tool is wrong because you're running a long-lived agent (autonomous loop / hive-mind worker / federation peer) and need to detect degradation before the breaker trips it. For one-shot Task invocations there is no history to score. Pair with hooks_post-task so the scores stay current.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| agentId | string | 아니오 | Specific agent ID (optional) | — |
| threshold | number | 아니오 | Health threshold (0-1) | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "agentId": {
      "type": "string",
      "description": "Specific agent ID (optional)"
    },
    "threshold": {
      "type": "number",
      "description": "Health threshold (0-1)"
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "agent_health",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## agent_update

출처: Ruflo 원본

### 기능과 사용 시점

Mutate a tracked agent's config (model, instructions, status, health) without re-spawning. Use when native Task tool is wrong because the agent already has accumulated state (taskCount, swarm membership, cost-tracking attribution) and you only need to tweak one field — for example, promoting an idle agent to running on a new task, or rotating its model from haiku to sonnet mid-loop. For a brand-new subagent, agent_spawn (or native Task) is the right call.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| agentId | string | 예 | ID of agent | — |
| status | string | 아니오 | New status | — |
| health | number | 아니오 | Health value (0-1) | — |
| taskCount | number | 아니오 | Task count | — |
| config | object | 아니오 | Config updates | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "agentId": {
      "type": "string",
      "description": "ID of agent"
    },
    "status": {
      "type": "string",
      "description": "New status"
    },
    "health": {
      "type": "number",
      "description": "Health value (0-1)"
    },
    "taskCount": {
      "type": "number",
      "description": "Task count"
    },
    "config": {
      "type": "object",
      "description": "Config updates"
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
  "name": "agent_update",
  "arguments": {
    "agentId": "<앞 단계에서 받은 ID>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## agent_logs

출처: Ruflo 원본

### 기능과 사용 시점

Return recorded activity-log entries for a tracked agent (idle/running history, last task result). Use when native Task tool is wrong because you need the agent's log across turns (what it did, last error/result, swarm context) rather than a one-shot Task transcript. For a Task you just ran, native Task output is fine. Pair with agent_list to find the agentId. (Hive-mind-spawned workers are resolved here too.) Today this returns the last task result as a synthetic entry — full per-agent activity logs land with hive worker execution wiring (ruvnet/ruflo#1916).

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| agentId | string | 예 | ID of agent | — |
| tail | number | 아니오 | Max recent entries to return (default 50) | — |
| level | string | 아니오 | Minimum log level (currently advisory — entries are synthetic) | {"enum":["debug","info","warn","error"]} |
| since | string | 아니오 | Show logs since, e.g. "1h" / "30m" (currently advisory) | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "agentId": {
      "type": "string",
      "description": "ID of agent"
    },
    "tail": {
      "type": "number",
      "description": "Max recent entries to return (default 50)"
    },
    "level": {
      "type": "string",
      "enum": [
        "debug",
        "info",
        "warn",
        "error"
      ],
      "description": "Minimum log level (currently advisory — entries are synthetic)"
    },
    "since": {
      "type": "string",
      "description": "Show logs since, e.g. \"1h\" / \"30m\" (currently advisory)"
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
  "name": "agent_logs",
  "arguments": {
    "agentId": "<앞 단계에서 받은 ID>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.
