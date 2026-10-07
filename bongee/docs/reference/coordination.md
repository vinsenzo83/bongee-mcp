# 분산 작업 조정

[전체 목차](../MANUAL.md) · [사용 순서](../WORKFLOWS.md)

- [coordination_topology](#coordination_topology)
- [coordination_load_balance](#coordination_load_balance)
- [coordination_sync](#coordination_sync)
- [coordination_node](#coordination_node)
- [coordination_consensus](#coordination_consensus)
- [coordination_orchestrate](#coordination_orchestrate)
- [coordination_metrics](#coordination_metrics)

## coordination_topology

출처: Ruflo 원본

### 기능과 사용 시점

Configure swarm topology Use when native Task is wrong because the work crosses multiple agents that need to vote/sync/load-balance — TodoWrite + a single Task cannot orchestrate consensus. For one-off subtask dispatch, native Task is fine.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| action | string | 아니오 | Action to perform | {"enum":["get","set","optimize"]} |
| type | string | 아니오 | Topology type | {"enum":["mesh","hierarchical","ring","star","hybrid","hierarchical-mesh"]} |
| maxNodes | number | 아니오 | Maximum nodes | — |
| redundancy | number | 아니오 | Redundancy level | — |
| consensusAlgorithm | string | 아니오 | Consensus algorithm | {"enum":["raft","byzantine","gossip","crdt"]} |

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
        "optimize"
      ],
      "description": "Action to perform"
    },
    "type": {
      "type": "string",
      "enum": [
        "mesh",
        "hierarchical",
        "ring",
        "star",
        "hybrid",
        "hierarchical-mesh"
      ],
      "description": "Topology type"
    },
    "maxNodes": {
      "type": "number",
      "description": "Maximum nodes"
    },
    "redundancy": {
      "type": "number",
      "description": "Redundancy level"
    },
    "consensusAlgorithm": {
      "type": "string",
      "enum": [
        "raft",
        "byzantine",
        "gossip",
        "crdt"
      ],
      "description": "Consensus algorithm"
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "coordination_topology",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## coordination_load_balance

출처: Ruflo 원본

### 기능과 사용 시점

Configure load balancing Use when native Task is wrong because the work crosses multiple agents that need to vote/sync/load-balance — TodoWrite + a single Task cannot orchestrate consensus. For one-off subtask dispatch, native Task is fine.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| action | string | 아니오 | Action to perform | {"enum":["get","set","distribute"]} |
| algorithm | string | 아니오 | Algorithm | {"enum":["round-robin","least-connections","weighted","adaptive"]} |
| weights | object | 아니오 | Node weights | — |
| task | string | 아니오 | Task to distribute | — |

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
        "distribute"
      ],
      "description": "Action to perform"
    },
    "algorithm": {
      "type": "string",
      "enum": [
        "round-robin",
        "least-connections",
        "weighted",
        "adaptive"
      ],
      "description": "Algorithm"
    },
    "weights": {
      "type": "object",
      "description": "Node weights"
    },
    "task": {
      "type": "string",
      "description": "Task to distribute"
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "coordination_load_balance",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## coordination_sync

출처: Ruflo 원본

### 기능과 사용 시점

Synchronize state across nodes Use when native Task is wrong because the work crosses multiple agents that need to vote/sync/load-balance — TodoWrite + a single Task cannot orchestrate consensus. For one-off subtask dispatch, native Task is fine.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| action | string | 아니오 | Action to perform | {"enum":["status","trigger","resolve"]} |
| force | boolean | 아니오 | Force synchronization | — |
| conflictResolution | string | 아니오 | Conflict resolution strategy | {"enum":["latest","merge","manual"]} |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "action": {
      "type": "string",
      "enum": [
        "status",
        "trigger",
        "resolve"
      ],
      "description": "Action to perform"
    },
    "force": {
      "type": "boolean",
      "description": "Force synchronization"
    },
    "conflictResolution": {
      "type": "string",
      "enum": [
        "latest",
        "merge",
        "manual"
      ],
      "description": "Conflict resolution strategy"
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "coordination_sync",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## coordination_node

출처: Ruflo 원본

### 기능과 사용 시점

Manage coordination nodes Use when native Task is wrong because the work crosses multiple agents that need to vote/sync/load-balance — TodoWrite + a single Task cannot orchestrate consensus. For one-off subtask dispatch, native Task is fine.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| action | string | 아니오 | Action to perform | {"enum":["list","add","remove","heartbeat"]} |
| nodeId | string | 아니오 | Node ID | — |
| status | string | 아니오 | Node status | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "action": {
      "type": "string",
      "enum": [
        "list",
        "add",
        "remove",
        "heartbeat"
      ],
      "description": "Action to perform"
    },
    "nodeId": {
      "type": "string",
      "description": "Node ID"
    },
    "status": {
      "type": "string",
      "description": "Node status"
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "coordination_node",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## coordination_consensus

출처: Ruflo 원본

### 기능과 사용 시점

Manage consensus protocol with BFT, Raft, or Quorum strategies Use when native Task is wrong because the work crosses multiple agents that need to vote/sync/load-balance — TodoWrite + a single Task cannot orchestrate consensus. For one-off subtask dispatch, native Task is fine.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| action | string | 아니오 | Action to perform | {"enum":["status","propose","vote","commit"]} |
| proposal | object | 아니오 | Proposal data (for propose) | — |
| proposalId | string | 아니오 | Proposal ID (for vote/commit/status) | — |
| vote | string | 아니오 | Vote | {"enum":["accept","reject"]} |
| voterId | string | 아니오 | Voter node ID | — |
| strategy | string | 아니오 | Consensus strategy (default: raft) | {"enum":["bft","raft","quorum"]} |
| quorumPreset | string | 아니오 | Quorum threshold preset (default: majority) | {"enum":["unanimous","majority","supermajority"]} |
| term | number | 아니오 | Term number (for raft strategy) | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "action": {
      "type": "string",
      "enum": [
        "status",
        "propose",
        "vote",
        "commit"
      ],
      "description": "Action to perform"
    },
    "proposal": {
      "type": "object",
      "description": "Proposal data (for propose)"
    },
    "proposalId": {
      "type": "string",
      "description": "Proposal ID (for vote/commit/status)"
    },
    "vote": {
      "type": "string",
      "enum": [
        "accept",
        "reject"
      ],
      "description": "Vote"
    },
    "voterId": {
      "type": "string",
      "description": "Voter node ID"
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
      "description": "Quorum threshold preset (default: majority)"
    },
    "term": {
      "type": "number",
      "description": "Term number (for raft strategy)"
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "coordination_consensus",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## coordination_orchestrate

출처: Ruflo 원본

### 기능과 사용 시점

Orchestrate multi-agent coordination Use when native Task is wrong because the work crosses multiple agents that need to vote/sync/load-balance — TodoWrite + a single Task cannot orchestrate consensus. For one-off subtask dispatch, native Task is fine.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| task | string | 예 | Task to orchestrate | — |
| agents | array | 아니오 | Agent IDs to coordinate | — |
| strategy | string | 아니오 | Orchestration strategy | {"enum":["parallel","sequential","pipeline","broadcast"]} |
| timeout | number | 아니오 | Timeout in ms | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "task": {
      "type": "string",
      "description": "Task to orchestrate"
    },
    "agents": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Agent IDs to coordinate"
    },
    "strategy": {
      "type": "string",
      "enum": [
        "parallel",
        "sequential",
        "pipeline",
        "broadcast"
      ],
      "description": "Orchestration strategy"
    },
    "timeout": {
      "type": "number",
      "description": "Timeout in ms"
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
  "name": "coordination_orchestrate",
  "arguments": {
    "task": "<task 입력>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## coordination_metrics

출처: Ruflo 원본

### 기능과 사용 시점

Get coordination metrics Use when native Task is wrong because the work crosses multiple agents that need to vote/sync/load-balance — TodoWrite + a single Task cannot orchestrate consensus. For one-off subtask dispatch, native Task is fine.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| metric | string | 아니오 | Metric type | {"enum":["all","latency","throughput","availability"]} |
| timeRange | string | 아니오 | Time range | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "metric": {
      "type": "string",
      "enum": [
        "all",
        "latency",
        "throughput",
        "availability"
      ],
      "description": "Metric type"
    },
    "timeRange": {
      "type": "string",
      "description": "Time range"
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "coordination_metrics",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.
