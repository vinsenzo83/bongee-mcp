# AgentDB 기억·그래프

[전체 목차](../MANUAL.md) · [사용 순서](../WORKFLOWS.md)

- [agentdb_health](#agentdb_health)
- [agentdb_controllers](#agentdb_controllers)
- [agentdb_pattern-store](#agentdb_pattern-store)
- [agentdb_pattern-search](#agentdb_pattern-search)
- [agentdb_feedback](#agentdb_feedback)
- [agentdb_causal-edge](#agentdb_causal-edge)
- [agentdb_causal-edge-delete](#agentdb_causal-edge-delete)
- [agentdb_causal-node-delete](#agentdb_causal-node-delete)
- [agentdb_route](#agentdb_route)
- [agentdb_session-start](#agentdb_session-start)
- [agentdb_session-end](#agentdb_session-end)
- [agentdb_hierarchical-store](#agentdb_hierarchical-store)
- [agentdb_hierarchical-recall](#agentdb_hierarchical-recall)
- [agentdb_hierarchical-delete](#agentdb_hierarchical-delete)
- [agentdb_consolidate](#agentdb_consolidate)
- [agentdb_batch](#agentdb_batch)
- [agentdb_context-synthesize](#agentdb_context-synthesize)
- [agentdb_semantic-route](#agentdb_semantic-route)
- [agentdb_graph-query](#agentdb_graph-query)
- [agentdb_graph-pathfinder](#agentdb_graph-pathfinder)

## agentdb_health

출처: Ruflo 원본

### 기능과 사용 시점

Get AgentDB v3 controller health status including cache stats and attestation count Use when generic memory_* tools are wrong because you need AgentDB-specific controllers (HNSW vector search, hierarchical tiers, causal-graph links, pattern store/recall, RaBitQ quantization). For simple key-value persistence, memory_store/memory_retrieve are simpler. For unrelated file work, native Read/Write are fine.

### 연결·실행 조건

원본의 선택적 DB·WASM·벡터/모델 패키지와 데이터가 필요할 수 있습니다. 초기 패키지·모델 다운로드와 실제 기능 사용 가능 여부를 확인합니다.

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
  "name": "agentdb_health",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## agentdb_controllers

출처: Ruflo 원본

### 기능과 사용 시점

List all AgentDB v3 controllers and their initialization status Use when generic memory_* tools are wrong because you need AgentDB-specific controllers (HNSW vector search, hierarchical tiers, causal-graph links, pattern store/recall, RaBitQ quantization). For simple key-value persistence, memory_store/memory_retrieve are simpler. For unrelated file work, native Read/Write are fine.

### 연결·실행 조건

원본의 선택적 DB·WASM·벡터/모델 패키지와 데이터가 필요할 수 있습니다. 초기 패키지·모델 다운로드와 실제 기능 사용 가능 여부를 확인합니다.

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
  "name": "agentdb_controllers",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## agentdb_pattern-store

출처: Ruflo 원본

### 기능과 사용 시점

Store a pattern directly via ReasoningBank controller Use when generic memory_* tools are wrong because you need AgentDB-specific controllers (HNSW vector search, hierarchical tiers, causal-graph links, pattern store/recall, RaBitQ quantization). For simple key-value persistence, memory_store/memory_retrieve are simpler. For unrelated file work, native Read/Write are fine.

### 연결·실행 조건

원본의 선택적 DB·WASM·벡터/모델 패키지와 데이터가 필요할 수 있습니다. 초기 패키지·모델 다운로드와 실제 기능 사용 가능 여부를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| pattern | string | 예 | Pattern description | — |
| type | string | 아니오 | Pattern type (e.g., task-routing, error-recovery) | — |
| confidence | number | 아니오 | Confidence score (0-1) | — |

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
      "description": "Pattern type (e.g., task-routing, error-recovery)"
    },
    "confidence": {
      "type": "number",
      "description": "Confidence score (0-1)"
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
  "name": "agentdb_pattern-store",
  "arguments": {
    "pattern": "<pattern 입력>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## agentdb_pattern-search

출처: Ruflo 원본

### 기능과 사용 시점

Search patterns via ReasoningBank controller with BM25+semantic hybrid Use when generic memory_* tools are wrong because you need AgentDB-specific controllers (HNSW vector search, hierarchical tiers, causal-graph links, pattern store/recall, RaBitQ quantization). For simple key-value persistence, memory_store/memory_retrieve are simpler. For unrelated file work, native Read/Write are fine.

### 연결·실행 조건

원본의 선택적 DB·WASM·벡터/모델 패키지와 데이터가 필요할 수 있습니다. 초기 패키지·모델 다운로드와 실제 기능 사용 가능 여부를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| query | string | 예 | Search query | — |
| topK | number | 아니오 | Number of results (default: 5) | — |
| minConfidence | number | 아니오 | Minimum score threshold (0-1) | — |

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
      "description": "Number of results (default: 5)"
    },
    "minConfidence": {
      "type": "number",
      "description": "Minimum score threshold (0-1)"
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
  "name": "agentdb_pattern-search",
  "arguments": {
    "query": "<query 입력>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## agentdb_feedback

출처: Ruflo 원본

### 기능과 사용 시점

Record task feedback for learning via LearningSystem + ReasoningBank controllers Use when generic memory_* tools are wrong because you need AgentDB-specific controllers (HNSW vector search, hierarchical tiers, causal-graph links, pattern store/recall, RaBitQ quantization). For simple key-value persistence, memory_store/memory_retrieve are simpler. For unrelated file work, native Read/Write are fine.

### 연결·실행 조건

원본의 선택적 DB·WASM·벡터/모델 패키지와 데이터가 필요할 수 있습니다. 초기 패키지·모델 다운로드와 실제 기능 사용 가능 여부를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| taskId | string | 예 | Task identifier | — |
| patterns | array | 아니오 | Learned patterns to retain; successful tasks with quality >= 0.9 may create reusable skills | {"maxItems":100} |
| success | boolean | 아니오 | Whether task succeeded | — |
| quality | number | 아니오 | Quality score (0-1) | — |
| agent | string | 아니오 | Agent that performed the task | — |

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
      "description": "Whether task succeeded"
    },
    "quality": {
      "type": "number",
      "description": "Quality score (0-1)"
    },
    "agent": {
      "type": "string",
      "description": "Agent that performed the task"
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
  "name": "agentdb_feedback",
  "arguments": {
    "taskId": "<앞 단계에서 받은 ID>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## agentdb_causal-edge

출처: Ruflo 원본

### 기능과 사용 시점

Record a causal edge between two memory entries via CausalMemoryGraph Use when generic memory_* tools are wrong because you need AgentDB-specific controllers (HNSW vector search, hierarchical tiers, causal-graph links, pattern store/recall, RaBitQ quantization). For simple key-value persistence, memory_store/memory_retrieve are simpler. For unrelated file work, native Read/Write are fine.

### 연결·실행 조건

원본의 선택적 DB·WASM·벡터/모델 패키지와 데이터가 필요할 수 있습니다. 초기 패키지·모델 다운로드와 실제 기능 사용 가능 여부를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| sourceId | string | 예 | Source entry ID | — |
| targetId | string | 예 | Target entry ID | — |
| relation | string | 예 | Relationship type (e.g., caused, preceded, succeeded) | — |
| weight | number | 아니오 | Edge weight (0-1) | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "sourceId": {
      "type": "string",
      "description": "Source entry ID"
    },
    "targetId": {
      "type": "string",
      "description": "Target entry ID"
    },
    "relation": {
      "type": "string",
      "description": "Relationship type (e.g., caused, preceded, succeeded)"
    },
    "weight": {
      "type": "number",
      "description": "Edge weight (0-1)"
    }
  },
  "required": [
    "sourceId",
    "targetId",
    "relation"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "agentdb_causal-edge",
  "arguments": {
    "sourceId": "<앞 단계에서 받은 ID>",
    "targetId": "<앞 단계에서 받은 ID>",
    "relation": "<relation 입력>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## agentdb_causal-edge-delete

출처: Ruflo 원본

### 기능과 사용 시점

Delete a causal edge between two memory entries. Returns controller="native-unsupported" when the edge lives in graph-node native storage (no public delete API). Use when generic memory_* tools are wrong because you need AgentDB-specific controllers (HNSW vector search, hierarchical tiers, causal-graph links, pattern store/recall, RaBitQ quantization). For simple key-value persistence, memory_store/memory_retrieve are simpler. For unrelated file work, native Read/Write are fine.

### 연결·실행 조건

원본의 선택적 DB·WASM·벡터/모델 패키지와 데이터가 필요할 수 있습니다. 초기 패키지·모델 다운로드와 실제 기능 사용 가능 여부를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| sourceId | string | 예 | Source entry ID | — |
| targetId | string | 예 | Target entry ID | — |
| relation | string | 아니오 | Optional relationship type filter | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "sourceId": {
      "type": "string",
      "description": "Source entry ID"
    },
    "targetId": {
      "type": "string",
      "description": "Target entry ID"
    },
    "relation": {
      "type": "string",
      "description": "Optional relationship type filter"
    }
  },
  "required": [
    "sourceId",
    "targetId"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "agentdb_causal-edge-delete",
  "arguments": {
    "sourceId": "<앞 단계에서 받은 ID>",
    "targetId": "<앞 단계에서 받은 ID>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## agentdb_causal-node-delete

출처: Ruflo 원본

### 기능과 사용 시점

Cascade-delete a causal node and all its incident edges from the SQL fallback. Native graph-node entries are unaffected (no delete API in the binding). Use when generic memory_* tools are wrong because you need AgentDB-specific controllers (HNSW vector search, hierarchical tiers, causal-graph links, pattern store/recall, RaBitQ quantization). For simple key-value persistence, memory_store/memory_retrieve are simpler. For unrelated file work, native Read/Write are fine.

### 연결·실행 조건

원본의 선택적 DB·WASM·벡터/모델 패키지와 데이터가 필요할 수 있습니다. 초기 패키지·모델 다운로드와 실제 기능 사용 가능 여부를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| nodeId | string | 예 | Node ID to delete (cascades to all incident edges) | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "nodeId": {
      "type": "string",
      "description": "Node ID to delete (cascades to all incident edges)"
    }
  },
  "required": [
    "nodeId"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "agentdb_causal-node-delete",
  "arguments": {
    "nodeId": "<앞 단계에서 받은 ID>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## agentdb_route

출처: Ruflo 원본

### 기능과 사용 시점

Route a task via AgentDB SemanticRouter or LearningSystem recommendAlgorithm Use when generic memory_* tools are wrong because you need AgentDB-specific controllers (HNSW vector search, hierarchical tiers, causal-graph links, pattern store/recall, RaBitQ quantization). For simple key-value persistence, memory_store/memory_retrieve are simpler. For unrelated file work, native Read/Write are fine.

### 연결·실행 조건

원본의 선택적 DB·WASM·벡터/모델 패키지와 데이터가 필요할 수 있습니다. 초기 패키지·모델 다운로드와 실제 기능 사용 가능 여부를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| task | string | 예 | Task description to route | — |
| context | string | 아니오 | Additional context | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "task": {
      "type": "string",
      "description": "Task description to route"
    },
    "context": {
      "type": "string",
      "description": "Additional context"
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
  "name": "agentdb_route",
  "arguments": {
    "task": "<task 입력>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## agentdb_session-start

출처: Ruflo 원본

### 기능과 사용 시점

Start a session with ReflexionMemory episodic replay Use when generic memory_* tools are wrong because you need AgentDB-specific controllers (HNSW vector search, hierarchical tiers, causal-graph links, pattern store/recall, RaBitQ quantization). For simple key-value persistence, memory_store/memory_retrieve are simpler. For unrelated file work, native Read/Write are fine.

### 연결·실행 조건

원본의 선택적 DB·WASM·벡터/모델 패키지와 데이터가 필요할 수 있습니다. 초기 패키지·모델 다운로드와 실제 기능 사용 가능 여부를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| sessionId | string | 예 | Session identifier | — |
| context | string | 아니오 | Session context for pattern retrieval | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "sessionId": {
      "type": "string",
      "description": "Session identifier"
    },
    "context": {
      "type": "string",
      "description": "Session context for pattern retrieval"
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
  "name": "agentdb_session-start",
  "arguments": {
    "sessionId": "<앞 단계에서 받은 ID>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## agentdb_session-end

출처: Ruflo 원본

### 기능과 사용 시점

End session, persist to ReflexionMemory, trigger NightlyLearner consolidation Use when generic memory_* tools are wrong because you need AgentDB-specific controllers (HNSW vector search, hierarchical tiers, causal-graph links, pattern store/recall, RaBitQ quantization). For simple key-value persistence, memory_store/memory_retrieve are simpler. For unrelated file work, native Read/Write are fine.

### 연결·실행 조건

원본의 선택적 DB·WASM·벡터/모델 패키지와 데이터가 필요할 수 있습니다. 초기 패키지·모델 다운로드와 실제 기능 사용 가능 여부를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| sessionId | string | 예 | Session identifier | — |
| summary | string | 아니오 | Session summary | — |
| tasksCompleted | number | 아니오 | Number of tasks completed | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "sessionId": {
      "type": "string",
      "description": "Session identifier"
    },
    "summary": {
      "type": "string",
      "description": "Session summary"
    },
    "tasksCompleted": {
      "type": "number",
      "description": "Number of tasks completed"
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
  "name": "agentdb_session-end",
  "arguments": {
    "sessionId": "<앞 단계에서 받은 ID>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## agentdb_hierarchical-store

출처: Ruflo 원본

### 기능과 사용 시점

Store to hierarchical memory with tier (working, episodic, semantic) Use when generic memory_* tools are wrong because you need AgentDB-specific controllers (HNSW vector search, hierarchical tiers, causal-graph links, pattern store/recall, RaBitQ quantization). For simple key-value persistence, memory_store/memory_retrieve are simpler. For unrelated file work, native Read/Write are fine.

### 연결·실행 조건

원본의 선택적 DB·WASM·벡터/모델 패키지와 데이터가 필요할 수 있습니다. 초기 패키지·모델 다운로드와 실제 기능 사용 가능 여부를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| key | string | 예 | Memory entry key | — |
| value | string | 예 | Memory entry value | — |
| tier | string | 아니오 | Memory tier (working, episodic, semantic) | {"enum":["working","episodic","semantic"],"default":"working"} |
| validFrom | string | 아니오 | Optional ISO-8601 timestamp from which this fact is valid (temporal validity — Zep/Graphiti-style). Omit for always-valid. | — |
| validUntil | string | 아니오 | Optional ISO-8601 timestamp after which this fact is no longer valid. Expired facts are hidden from recall unless includeExpired=true. | — |
| supersedes | string | 아니오 | Optional id (or key) of an existing entry this fact supersedes. The old entry is INVALIDATED (stamped validUntil=now + supersededBy=<new id>), not deleted — it stays auditable via recall includeExpired=true. | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "key": {
      "type": "string",
      "description": "Memory entry key"
    },
    "value": {
      "type": "string",
      "description": "Memory entry value"
    },
    "tier": {
      "type": "string",
      "description": "Memory tier (working, episodic, semantic)",
      "enum": [
        "working",
        "episodic",
        "semantic"
      ],
      "default": "working"
    },
    "validFrom": {
      "type": "string",
      "description": "Optional ISO-8601 timestamp from which this fact is valid (temporal validity — Zep/Graphiti-style). Omit for always-valid."
    },
    "validUntil": {
      "type": "string",
      "description": "Optional ISO-8601 timestamp after which this fact is no longer valid. Expired facts are hidden from recall unless includeExpired=true."
    },
    "supersedes": {
      "type": "string",
      "description": "Optional id (or key) of an existing entry this fact supersedes. The old entry is INVALIDATED (stamped validUntil=now + supersededBy=<new id>), not deleted — it stays auditable via recall includeExpired=true."
    }
  },
  "required": [
    "key",
    "value"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "agentdb_hierarchical-store",
  "arguments": {
    "key": "<key 입력>",
    "value": "<value 입력>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## agentdb_hierarchical-recall

출처: Ruflo 원본

### 기능과 사용 시점

Recall from hierarchical memory with optional tier filter Use when generic memory_* tools are wrong because you need AgentDB-specific controllers (HNSW vector search, hierarchical tiers, causal-graph links, pattern store/recall, RaBitQ quantization). For simple key-value persistence, memory_store/memory_retrieve are simpler. For unrelated file work, native Read/Write are fine.

### 연결·실행 조건

원본의 선택적 DB·WASM·벡터/모델 패키지와 데이터가 필요할 수 있습니다. 초기 패키지·모델 다운로드와 실제 기능 사용 가능 여부를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| query | string | 예 | Recall query | — |
| tier | string | 아니오 | Filter by tier (working, episodic, semantic) | — |
| topK | number | 아니오 | Number of results (default: 5) | — |
| includeExpired | boolean | 아니오 | Include temporally-invalid entries (superseded, expired, or not-yet-valid). Audit escape hatch — default false. | {"default":false} |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "query": {
      "type": "string",
      "description": "Recall query"
    },
    "tier": {
      "type": "string",
      "description": "Filter by tier (working, episodic, semantic)"
    },
    "topK": {
      "type": "number",
      "description": "Number of results (default: 5)"
    },
    "includeExpired": {
      "type": "boolean",
      "description": "Include temporally-invalid entries (superseded, expired, or not-yet-valid). Audit escape hatch — default false.",
      "default": false
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
  "name": "agentdb_hierarchical-recall",
  "arguments": {
    "query": "<query 입력>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## agentdb_hierarchical-delete

출처: Ruflo 원본

### 기능과 사용 시점

Delete a hierarchical-memory entry by key. Returns controller="native-unsupported" when the entry is in a backend without a public delete API. Use when generic memory_* tools are wrong because you need AgentDB-specific controllers (HNSW vector search, hierarchical tiers, causal-graph links, pattern store/recall, RaBitQ quantization). For simple key-value persistence, memory_store/memory_retrieve are simpler. For unrelated file work, native Read/Write are fine.

### 연결·실행 조건

원본의 선택적 DB·WASM·벡터/모델 패키지와 데이터가 필요할 수 있습니다. 초기 패키지·모델 다운로드와 실제 기능 사용 가능 여부를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| key | string | 예 | Memory entry key to delete | — |
| tier | string | 아니오 | Optional tier filter (working, episodic, semantic) | {"enum":["working","episodic","semantic"]} |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "key": {
      "type": "string",
      "description": "Memory entry key to delete"
    },
    "tier": {
      "type": "string",
      "description": "Optional tier filter (working, episodic, semantic)",
      "enum": [
        "working",
        "episodic",
        "semantic"
      ]
    }
  },
  "required": [
    "key"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "agentdb_hierarchical-delete",
  "arguments": {
    "key": "<key 입력>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## agentdb_consolidate

출처: Ruflo 원본

### 기능과 사용 시점

Request memory consolidation. Use when checking whether AgentDB can consolidate retained memories; native file edits cannot perform controller consolidation. Currently returns unsupported when the installed controller is a no-op stub; no entries are promoted or compressed in that case.

### 연결·실행 조건

원본의 선택적 DB·WASM·벡터/모델 패키지와 데이터가 필요할 수 있습니다. 초기 패키지·모델 다운로드와 실제 기능 사용 가능 여부를 확인합니다.

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
  "name": "agentdb_consolidate",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## agentdb_batch

출처: Ruflo 원본

### 기능과 사용 시점

Batch operations on AgentDB episodes (insert, update, delete). Note: entries are stored in the AgentDB episodes table, not the memory_search namespace. Use memory_store for entries that should be searchable via memory_search. Use when generic memory_* tools are wrong because you need AgentDB-specific controllers (HNSW vector search, hierarchical tiers, causal-graph links, pattern store/recall, RaBitQ quantization). For simple key-value persistence, memory_store/memory_retrieve are simpler. For unrelated file work, native Read/Write are fine.

### 연결·실행 조건

원본의 선택적 DB·WASM·벡터/모델 패키지와 데이터가 필요할 수 있습니다. 초기 패키지·모델 다운로드와 실제 기능 사용 가능 여부를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| operation | string | 예 | Batch operation type | {"enum":["insert","update","delete"]} |
| entries | array | 예 | Array of {key, value} entries to operate on | — |
| entries[].key | string | 예 (상위 제공 시) | — | — |
| entries[].value | string | 아니오 | — | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "operation": {
      "type": "string",
      "description": "Batch operation type",
      "enum": [
        "insert",
        "update",
        "delete"
      ]
    },
    "entries": {
      "type": "array",
      "description": "Array of {key, value} entries to operate on",
      "items": {
        "type": "object",
        "properties": {
          "key": {
            "type": "string"
          },
          "value": {
            "type": "string"
          }
        },
        "required": [
          "key"
        ]
      }
    }
  },
  "required": [
    "operation",
    "entries"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "agentdb_batch",
  "arguments": {
    "operation": "insert",
    "entries": [
      {
        "key": "<key 입력>"
      }
    ]
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## agentdb_context-synthesize

출처: Ruflo 원본

### 기능과 사용 시점

Synthesize context from stored memories for a given query Use when generic memory_* tools are wrong because you need AgentDB-specific controllers (HNSW vector search, hierarchical tiers, causal-graph links, pattern store/recall, RaBitQ quantization). For simple key-value persistence, memory_store/memory_retrieve are simpler. For unrelated file work, native Read/Write are fine.

### 연결·실행 조건

원본의 선택적 DB·WASM·벡터/모델 패키지와 데이터가 필요할 수 있습니다. 초기 패키지·모델 다운로드와 실제 기능 사용 가능 여부를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| query | string | 예 | Query to synthesize context for | — |
| maxEntries | number | 아니오 | Maximum entries to include (default: 10) | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "query": {
      "type": "string",
      "description": "Query to synthesize context for"
    },
    "maxEntries": {
      "type": "number",
      "description": "Maximum entries to include (default: 10)"
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
  "name": "agentdb_context-synthesize",
  "arguments": {
    "query": "<query 입력>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## agentdb_semantic-route

출처: Ruflo 원본

### 기능과 사용 시점

Route an input via AgentDB SemanticRouter for intent classification Use when generic memory_* tools are wrong because you need AgentDB-specific controllers (HNSW vector search, hierarchical tiers, causal-graph links, pattern store/recall, RaBitQ quantization). For simple key-value persistence, memory_store/memory_retrieve are simpler. For unrelated file work, native Read/Write are fine.

### 연결·실행 조건

원본의 선택적 DB·WASM·벡터/모델 패키지와 데이터가 필요할 수 있습니다. 초기 패키지·모델 다운로드와 실제 기능 사용 가능 여부를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| input | string | 예 | Input text to route | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "input": {
      "type": "string",
      "description": "Input text to route"
    }
  },
  "required": [
    "input"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "agentdb_semantic-route",
  "arguments": {
    "input": "<input 입력>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## agentdb_graph-query

출처: Ruflo 원본

### 기능과 사용 시점

Unified graph traversal across the knowledge graph (ADR-130). K-hop queries read committed graph_edges relationships through SQL; a separately populated native graph is not evidence of retained-history coverage. Inspect appliedDepth/truncated because SQL is bounded at 3 hops. maxNodesVisited bounds returned rows, not traversal work or elapsed time. Semantic and PageRank modes use their own backends. Use when you need relationship traversal beyond flat memory search.

### 연결·실행 조건

원본의 선택적 DB·WASM·벡터/모델 패키지와 데이터가 필요할 수 있습니다. 초기 패키지·모델 다운로드와 실제 기능 사용 가능 여부를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| nodeId | string | 예 | Domain-prefixed node ID (e.g. "agent:abc", "entity:xyz") | — |
| mode | string | 예 | Query mode: k-hop neighbor expansion, semantic cosine search, or PageRank scoring | {"enum":["k-hop","semantic","pagerank"]} |
| depth | number | 아니오 | Requested k-hop depth (default 2, max 5); SQL responses report appliedDepth and truncated when limited to 3 | — |
| topK | number | 아니오 | Max results for semantic and pagerank modes (default 10) | — |
| relation | string | 아니오 | Optional edge relation filter | — |
| complexityBudget | object | 아니오 | Computation limits | — |
| complexityBudget.maxNodesVisited | number | 아니오 | — | — |
| complexityBudget.maxDepth | number | 아니오 | — | — |
| complexityBudget.maxMillis | number | 아니오 | — | — |
| complexityBudget.maxMemoryMB | number | 아니오 | — | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "nodeId": {
      "type": "string",
      "description": "Domain-prefixed node ID (e.g. \"agent:abc\", \"entity:xyz\")"
    },
    "mode": {
      "type": "string",
      "enum": [
        "k-hop",
        "semantic",
        "pagerank"
      ],
      "description": "Query mode: k-hop neighbor expansion, semantic cosine search, or PageRank scoring"
    },
    "depth": {
      "type": "number",
      "description": "Requested k-hop depth (default 2, max 5); SQL responses report appliedDepth and truncated when limited to 3"
    },
    "topK": {
      "type": "number",
      "description": "Max results for semantic and pagerank modes (default 10)"
    },
    "relation": {
      "type": "string",
      "description": "Optional edge relation filter"
    },
    "complexityBudget": {
      "type": "object",
      "description": "Computation limits",
      "properties": {
        "maxNodesVisited": {
          "type": "number"
        },
        "maxDepth": {
          "type": "number"
        },
        "maxMillis": {
          "type": "number"
        },
        "maxMemoryMB": {
          "type": "number"
        }
      }
    }
  },
  "required": [
    "nodeId",
    "mode"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "agentdb_graph-query",
  "arguments": {
    "nodeId": "<앞 단계에서 받은 ID>",
    "mode": "k-hop"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## agentdb_graph-pathfinder

출처: Ruflo 원본

### 기능과 사용 시점

Multi-algorithm native graph pathfinder (ADR-130 Phase 5). Use when agentdb_graph-query k-hop is not enough — pathfinder supports personalized-pagerank, dynamic-mincut, spectral-sparsify, temporal-centrality, connected-component-churn, and witness-chain-divergence. Prefer over prompt-level graph loops in ruflo-knowledge-graph graph-navigator when you need ranked paths with formal complexityBudget enforcement.

### 연결·실행 조건

원본의 선택적 DB·WASM·벡터/모델 패키지와 데이터가 필요할 수 있습니다. 초기 패키지·모델 다운로드와 실제 기능 사용 가능 여부를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| seedNodeId | string | 예 | Domain-prefixed start node (e.g. "entity:auth-module") | — |
| query | string | 예 | Natural-language query for relevance scoring | — |
| depth | number | 아니오 | Expansion depth (default 3, max 5) | — |
| threshold | number | 아니오 | Minimum cumulative relevance score (default 0.3) | — |
| topK | number | 아니오 | Max paths returned (default 10) | — |
| algorithm | string | 아니오 | Graph algorithm (default: personalized-pagerank) | {"enum":["personalized-pagerank","dynamic-mincut","spectral-sparsify","temporal-centrality","connected-component-churn","witness-chain-divergence"]} |
| complexityBudget | object | 아니오 | — | — |
| complexityBudget.maxNodesVisited | number | 아니오 | — | — |
| complexityBudget.maxDepth | number | 아니오 | — | — |
| complexityBudget.maxMillis | number | 아니오 | — | — |
| complexityBudget.maxMemoryMB | number | 아니오 | — | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "seedNodeId": {
      "type": "string",
      "description": "Domain-prefixed start node (e.g. \"entity:auth-module\")"
    },
    "query": {
      "type": "string",
      "description": "Natural-language query for relevance scoring"
    },
    "depth": {
      "type": "number",
      "description": "Expansion depth (default 3, max 5)"
    },
    "threshold": {
      "type": "number",
      "description": "Minimum cumulative relevance score (default 0.3)"
    },
    "topK": {
      "type": "number",
      "description": "Max paths returned (default 10)"
    },
    "algorithm": {
      "type": "string",
      "enum": [
        "personalized-pagerank",
        "dynamic-mincut",
        "spectral-sparsify",
        "temporal-centrality",
        "connected-component-churn",
        "witness-chain-divergence"
      ],
      "description": "Graph algorithm (default: personalized-pagerank)"
    },
    "complexityBudget": {
      "type": "object",
      "properties": {
        "maxNodesVisited": {
          "type": "number"
        },
        "maxDepth": {
          "type": "number"
        },
        "maxMillis": {
          "type": "number"
        },
        "maxMemoryMB": {
          "type": "number"
        }
      }
    }
  },
  "required": [
    "seedNodeId",
    "query"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "agentdb_graph-pathfinder",
  "arguments": {
    "seedNodeId": "<앞 단계에서 받은 ID>",
    "query": "<query 입력>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.
