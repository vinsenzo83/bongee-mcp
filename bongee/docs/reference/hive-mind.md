# 집단 에이전트 협업

[전체 목차](../MANUAL.md) · [사용 순서](../WORKFLOWS.md)

- [hive-mind_spawn](#hive-mind_spawn)
- [hive-mind_init](#hive-mind_init)
- [hive-mind_status](#hive-mind_status)
- [hive-mind_join](#hive-mind_join)
- [hive-mind_leave](#hive-mind_leave)
- [hive-mind_consensus](#hive-mind_consensus)
- [hive-mind_broadcast](#hive-mind_broadcast)
- [hive-mind_shutdown](#hive-mind_shutdown)
- [hive-mind_memory](#hive-mind_memory)
- [hive-mind_optimize-memory](#hive-mind_optimize-memory)

## hive-mind_spawn

출처: Ruflo 원본

### 기능과 사용 시점

Spawn workers and automatically join them to the hive-mind (combines agent/spawn + hive-mind/join) Use when native Task is wrong because you need queen-led collective intelligence — Byzantine-FT consensus, broadcast across many worker agents, shared memory with bounded conflict. For a single subagent, native Task is fine. Pair with swarm_init first to set topology.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| count | number | 아니오 | Number of workers to spawn (default: 1) | {"default":1} |
| role | string | 아니오 | Worker role in hive | {"enum":["worker","specialist","scout"],"default":"worker"} |
| agentType | string | 아니오 | Agent type for spawned workers | {"default":"worker"} |
| prefix | string | 아니오 | Prefix for worker IDs | {"default":"hive-worker"} |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "count": {
      "type": "number",
      "description": "Number of workers to spawn (default: 1)",
      "default": 1
    },
    "role": {
      "type": "string",
      "enum": [
        "worker",
        "specialist",
        "scout"
      ],
      "description": "Worker role in hive",
      "default": "worker"
    },
    "agentType": {
      "type": "string",
      "description": "Agent type for spawned workers",
      "default": "worker"
    },
    "prefix": {
      "type": "string",
      "description": "Prefix for worker IDs",
      "default": "hive-worker"
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "hive-mind_spawn",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## hive-mind_init

출처: Ruflo 원본

### 기능과 사용 시점

Initialize the hive-mind collective Use when native Task is wrong because you need queen-led collective intelligence — Byzantine-FT consensus, broadcast across many worker agents, shared memory with bounded conflict. For a single subagent, native Task is fine. Pair with swarm_init first to set topology.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| topology | string | 아니오 | Network topology | {"enum":["mesh","hierarchical","ring","star"]} |
| consensus | string | 아니오 | Consensus strategy. Default: raft (anti-drift). Use byzantine for f<n/3 fault tolerance. | {"enum":["raft","byzantine","gossip","crdt","quorum"]} |
| queenId | string | 아니오 | Initial queen agent ID | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "topology": {
      "type": "string",
      "enum": [
        "mesh",
        "hierarchical",
        "ring",
        "star"
      ],
      "description": "Network topology"
    },
    "consensus": {
      "type": "string",
      "enum": [
        "raft",
        "byzantine",
        "gossip",
        "crdt",
        "quorum"
      ],
      "description": "Consensus strategy. Default: raft (anti-drift). Use byzantine for f<n/3 fault tolerance."
    },
    "queenId": {
      "type": "string",
      "description": "Initial queen agent ID"
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "hive-mind_init",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## hive-mind_status

출처: Ruflo 원본

### 기능과 사용 시점

Get hive-mind status Use when native Task is wrong because you need queen-led collective intelligence — Byzantine-FT consensus, broadcast across many worker agents, shared memory with bounded conflict. For a single subagent, native Task is fine. Pair with swarm_init first to set topology.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| verbose | boolean | 아니오 | Include detailed information | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "verbose": {
      "type": "boolean",
      "description": "Include detailed information"
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "hive-mind_status",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## hive-mind_join

출처: Ruflo 원본

### 기능과 사용 시점

Join an agent to the hive-mind Use when native Task is wrong because you need queen-led collective intelligence — Byzantine-FT consensus, broadcast across many worker agents, shared memory with bounded conflict. For a single subagent, native Task is fine. Pair with swarm_init first to set topology.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| agentId | string | 예 | Agent ID to join | — |
| role | string | 아니오 | Agent role in hive | {"enum":["worker","specialist","scout"]} |
| hiveToken | string | 예 | Capability token minted by hive-mind_init | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "agentId": {
      "type": "string",
      "description": "Agent ID to join"
    },
    "role": {
      "type": "string",
      "enum": [
        "worker",
        "specialist",
        "scout"
      ],
      "description": "Agent role in hive"
    },
    "hiveToken": {
      "type": "string",
      "description": "Capability token minted by hive-mind_init"
    }
  },
  "required": [
    "agentId",
    "hiveToken"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "hive-mind_join",
  "arguments": {
    "agentId": "<앞 단계에서 받은 ID>",
    "hiveToken": "<본인 연결 권한 값>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## hive-mind_leave

출처: Ruflo 원본

### 기능과 사용 시점

Remove an agent from the hive-mind Use when native Task is wrong because you need queen-led collective intelligence — Byzantine-FT consensus, broadcast across many worker agents, shared memory with bounded conflict. For a single subagent, native Task is fine. Pair with swarm_init first to set topology.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| agentId | string | 예 | Agent ID to remove | — |
| hiveToken | string | 예 | Capability token minted by hive-mind_init | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "agentId": {
      "type": "string",
      "description": "Agent ID to remove"
    },
    "hiveToken": {
      "type": "string",
      "description": "Capability token minted by hive-mind_init"
    }
  },
  "required": [
    "agentId",
    "hiveToken"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "hive-mind_leave",
  "arguments": {
    "agentId": "<앞 단계에서 받은 ID>",
    "hiveToken": "<본인 연결 권한 값>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## hive-mind_consensus

출처: Ruflo 원본

### 기능과 사용 시점

Propose or vote on consensus with BFT, Raft, or Quorum strategies Use when native Task is wrong because you need queen-led collective intelligence — Byzantine-FT consensus, broadcast across many worker agents, shared memory with bounded conflict. For a single subagent, native Task is fine. Pair with swarm_init first to set topology.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| action | string | 예 | Consensus action | {"enum":["propose","vote","status","list"]} |
| proposalId | string | 아니오 | Proposal ID (for vote/status) | — |
| type | string | 아니오 | Proposal type (for propose) | — |
| value | 지정 없음 | 아니오 | Proposal value (for propose) | — |
| vote | boolean | 아니오 | Vote (true=for, false=against) | — |
| voterId | string | 아니오 | Voter agent ID | — |
| hiveToken | string | 아니오 | Capability token minted by hive-mind_init (required to vote) | — |
| strategy | string | 아니오 | Consensus strategy (default: raft) | {"enum":["bft","raft","quorum"]} |
| quorumPreset | string | 아니오 | Quorum threshold preset (for quorum strategy, default: majority) | {"enum":["unanimous","majority","supermajority"]} |
| term | number | 아니오 | Term number (for raft strategy) | — |
| timeoutMs | number | 아니오 | Timeout in ms for raft re-proposal (default: 30000) | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "action": {
      "type": "string",
      "enum": [
        "propose",
        "vote",
        "status",
        "list"
      ],
      "description": "Consensus action"
    },
    "proposalId": {
      "type": "string",
      "description": "Proposal ID (for vote/status)"
    },
    "type": {
      "type": "string",
      "description": "Proposal type (for propose)"
    },
    "value": {
      "description": "Proposal value (for propose)"
    },
    "vote": {
      "type": "boolean",
      "description": "Vote (true=for, false=against)"
    },
    "voterId": {
      "type": "string",
      "description": "Voter agent ID"
    },
    "hiveToken": {
      "type": "string",
      "description": "Capability token minted by hive-mind_init (required to vote)"
    },
    "strategy": {
      "type": "string",
      "enum": [
        "bft",
        "raft",
        "quorum"
      ],
      "description": "Consensus strategy (default: raft)"
    },
    "quorumPreset": {
      "type": "string",
      "enum": [
        "unanimous",
        "majority",
        "supermajority"
      ],
      "description": "Quorum threshold preset (for quorum strategy, default: majority)"
    },
    "term": {
      "type": "number",
      "description": "Term number (for raft strategy)"
    },
    "timeoutMs": {
      "type": "number",
      "description": "Timeout in ms for raft re-proposal (default: 30000)"
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
  "name": "hive-mind_consensus",
  "arguments": {
    "action": "propose"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## hive-mind_broadcast

출처: Ruflo 원본

### 기능과 사용 시점

Broadcast message to all workers Use when native Task is wrong because you need queen-led collective intelligence — Byzantine-FT consensus, broadcast across many worker agents, shared memory with bounded conflict. For a single subagent, native Task is fine. Pair with swarm_init first to set topology.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| message | string | 예 | Message to broadcast | — |
| priority | string | 아니오 | Message priority | {"enum":["low","normal","high","critical"]} |
| fromId | string | 아니오 | Sender agent ID | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "message": {
      "type": "string",
      "description": "Message to broadcast"
    },
    "priority": {
      "type": "string",
      "enum": [
        "low",
        "normal",
        "high",
        "critical"
      ],
      "description": "Message priority"
    },
    "fromId": {
      "type": "string",
      "description": "Sender agent ID"
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
  "name": "hive-mind_broadcast",
  "arguments": {
    "message": "<message 입력>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## hive-mind_shutdown

출처: Ruflo 원본

### 기능과 사용 시점

Shutdown the hive-mind and terminate all workers Use when native Task is wrong because you need queen-led collective intelligence — Byzantine-FT consensus, broadcast across many worker agents, shared memory with bounded conflict. For a single subagent, native Task is fine. Pair with swarm_init first to set topology.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| graceful | boolean | 아니오 | Graceful shutdown (wait for pending tasks) | {"default":true} |
| force | boolean | 아니오 | Force immediate shutdown | {"default":false} |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "graceful": {
      "type": "boolean",
      "description": "Graceful shutdown (wait for pending tasks)",
      "default": true
    },
    "force": {
      "type": "boolean",
      "description": "Force immediate shutdown",
      "default": false
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "hive-mind_shutdown",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## hive-mind_memory

출처: Ruflo 원본

### 기능과 사용 시점

Access hive shared memory Use when native Task is wrong because you need queen-led collective intelligence — Byzantine-FT consensus, broadcast across many worker agents, shared memory with bounded conflict. For a single subagent, native Task is fine. Pair with swarm_init first to set topology.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| action | string | 예 | Memory action | {"enum":["get","set","delete","list"]} |
| key | string | 아니오 | Memory key | — |
| value | 지정 없음 | 아니오 | Value to store (for set) | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "action": {
      "type": "string",
      "enum": [
        "get",
        "set",
        "delete",
        "list"
      ],
      "description": "Memory action"
    },
    "key": {
      "type": "string",
      "description": "Memory key"
    },
    "value": {
      "description": "Value to store (for set)"
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
  "name": "hive-mind_memory",
  "arguments": {
    "action": "get"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## hive-mind_optimize-memory

출처: Ruflo 원본

### 기능과 사용 시점

Compact the hive-mind shared-memory store (drops null/empty keys) and report before/after pattern counts. Use when native conversation memory is wrong because you need the queen-led collective's persisted shared state cleaned up between phases. For one-shot scratch state, no tool needed. (Pattern-quality consolidation is delegated to the intelligence pipeline — this only does the cheap structural pass for now.)

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| qualityThreshold | number | 아니오 | Quality threshold for pattern retention (advisory — not enforced yet) | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "qualityThreshold": {
      "type": "number",
      "description": "Quality threshold for pattern retention (advisory — not enforced yet)"
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "hive-mind_optimize-memory",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.
