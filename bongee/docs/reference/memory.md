# 기억 저장·검색·이동

[전체 목차](../MANUAL.md) · [사용 순서](../WORKFLOWS.md)

- [memory_store](#memory_store)
- [memory_retrieve](#memory_retrieve)
- [memory_search](#memory_search)
- [memory_delete](#memory_delete)
- [memory_list](#memory_list)
- [memory_stats](#memory_stats)
- [memory_migrate](#memory_migrate)
- [memory_import_claude](#memory_import_claude)
- [memory_bridge_status](#memory_bridge_status)
- [memory_search_unified](#memory_search_unified)
- [memory_detailed-stats](#memory_detailed-stats)
- [memory_cleanup](#memory_cleanup)
- [memory_compress](#memory_compress)
- [memory_export](#memory_export)
- [memory_import](#memory_import)

## memory_store

출처: Ruflo 원본

### 기능과 사용 시점

Persistent key-value store with vector embedding — survives across sessions and is searchable by meaning, not just by file path. Use when native Write is wrong because the data is not a file (e.g. a learned pattern, a decision, a budget config) AND you need to recall it later by semantic query, not by path. Defaults to namespace="default". Upsert semantics: writing an existing key updates it (matching the CLI `memory store` default); pass `upsert: false` to force strict-insert instead.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| key | string | 예 | Memory key (unique within namespace) | — |
| value | 지정 없음 | 예 | Value to store (string or object) | — |
| namespace | string | 아니오 | Namespace for organization (default: "default") | — |
| tags | array | 아니오 | Optional tags for filtering | — |
| ttl | number | 아니오 | Time-to-live in seconds (optional) | — |
| upsert | boolean | 아니오 | Update existing key instead of failing (default: true, matching CLI `memory store`; set false for strict-insert). #2775 parity. | — |
| provenance_type | string | 아니오 | ADR-323: who/what produced this value, so shared-namespace retrieval can filter by trust level instead of conflating a user's stated claim with an agent's own output. Default: "unknown". | {"enum":["user_claim","agent_output","system_observation","tool_result","unknown"]} |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "key": {
      "type": "string",
      "description": "Memory key (unique within namespace)"
    },
    "value": {
      "description": "Value to store (string or object)"
    },
    "namespace": {
      "type": "string",
      "description": "Namespace for organization (default: \"default\")"
    },
    "tags": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Optional tags for filtering"
    },
    "ttl": {
      "type": "number",
      "description": "Time-to-live in seconds (optional)"
    },
    "upsert": {
      "type": "boolean",
      "description": "Update existing key instead of failing (default: true, matching CLI `memory store`; set false for strict-insert). #2775 parity."
    },
    "provenance_type": {
      "type": "string",
      "enum": [
        "user_claim",
        "agent_output",
        "system_observation",
        "tool_result",
        "unknown"
      ],
      "description": "ADR-323: who/what produced this value, so shared-namespace retrieval can filter by trust level instead of conflating a user's stated claim with an agent's own output. Default: \"unknown\"."
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
  "name": "memory_store",
  "arguments": {
    "key": "<key 입력>",
    "value": "<value 입력>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## memory_retrieve

출처: Ruflo 원본

### 기능과 사용 시점

Read back a value previously stored via memory_store, by exact (namespace, key) — lossless, includes metadata. Use when native Read is wrong because the value is not a file (it lives in the .swarm/memory.db SQLite store) AND you know the exact key. For semantic lookup by meaning, use memory_search.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| key | string | 예 | Memory key | — |
| namespace | string | 아니오 | Namespace (default: "default") | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "key": {
      "type": "string",
      "description": "Memory key"
    },
    "namespace": {
      "type": "string",
      "description": "Namespace (default: \"default\")"
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
  "name": "memory_retrieve",
  "arguments": {
    "key": "<key 입력>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## memory_search

출처: Ruflo 원본

### 기능과 사용 시점

Find stored memories by meaning (vector similarity), not by literal text — finds "JWT auth pattern" when you query "token-based login flow". Use when native Grep is wrong because Grep matches characters and you need to find conceptually-related entries across past sessions. Returns top-k with similarity: raw retrieval relevance, which may include lexical scoring and is not guaranteed to be cosine similarity. With smart=true, similarity is the highest raw score across query variants; rankingScore is the composite relevance score used by the ranking pipeline, not cosine similarity, probability, or confidence. Diversity can change result order.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| query | string | 예 | Search query (semantic similarity) | — |
| namespace | string | 아니오 | Namespace to search (default: all namespaces — omit to search across every namespace) | — |
| limit | number | 아니오 | Maximum results (default: 10) | — |
| threshold | number | 아니오 | Minimum raw retrieval relevance 0-1 for candidate admission, applied per query before SmartRetrieval ranking; not a floor on rankingScore (default: 0.3) | — |
| smart | boolean | 아니오 | Enable SmartRetrieval — query expansion, RRF fusion, recency boost, MMR diversity; preserves raw similarity and adds rankingScore (default: false) | — |
| provenance_filter | array | 아니오 | ADR-323: restrict results to these provenance types (e.g. exclude user_claim when fact-checking). Omit for no filtering. Enforced for standard and SmartRetrieval searches. | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "query": {
      "type": "string",
      "description": "Search query (semantic similarity)"
    },
    "namespace": {
      "type": "string",
      "description": "Namespace to search (default: all namespaces — omit to search across every namespace)"
    },
    "limit": {
      "type": "number",
      "description": "Maximum results (default: 10)"
    },
    "threshold": {
      "type": "number",
      "description": "Minimum raw retrieval relevance 0-1 for candidate admission, applied per query before SmartRetrieval ranking; not a floor on rankingScore (default: 0.3)"
    },
    "smart": {
      "type": "boolean",
      "description": "Enable SmartRetrieval — query expansion, RRF fusion, recency boost, MMR diversity; preserves raw similarity and adds rankingScore (default: false)"
    },
    "provenance_filter": {
      "type": "array",
      "items": {
        "type": "string",
        "enum": [
          "user_claim",
          "agent_output",
          "system_observation",
          "tool_result",
          "unknown"
        ]
      },
      "description": "ADR-323: restrict results to these provenance types (e.g. exclude user_claim when fact-checking). Omit for no filtering. Enforced for standard and SmartRetrieval searches."
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
  "name": "memory_search",
  "arguments": {
    "query": "<query 입력>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## memory_delete

출처: Ruflo 원본

### 기능과 사용 시점

Remove a stored memory entry by exact (namespace, key). Use when a previously stored decision is invalidated or contains stale data. No native equivalent — Write to a file does not affect the .swarm/memory.db SQLite store.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| key | string | 예 | Memory key | — |
| namespace | string | 아니오 | Namespace (default: "default") | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "key": {
      "type": "string",
      "description": "Memory key"
    },
    "namespace": {
      "type": "string",
      "description": "Namespace (default: \"default\")"
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
  "name": "memory_delete",
  "arguments": {
    "key": "<key 입력>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## memory_list

출처: Ruflo 원본

### 기능과 사용 시점

Enumerate stored memory entries (optionally filtered by namespace/tags) without semantic search. Use when native Glob is wrong because the entries are not files (they live in .swarm/memory.db). For inspection / audit / "what is in my memory" — pair with memory_search for retrieval-by-meaning.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| namespace | string | 아니오 | Filter by namespace | — |
| limit | number | 아니오 | Maximum results (default: 50) | — |
| offset | number | 아니오 | Offset for pagination (default: 0) | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "namespace": {
      "type": "string",
      "description": "Filter by namespace"
    },
    "limit": {
      "type": "number",
      "description": "Maximum results (default: 50)"
    },
    "offset": {
      "type": "number",
      "description": "Offset for pagination (default: 0)"
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "memory_list",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## memory_stats

출처: Ruflo 원본

### 기능과 사용 시점

Get memory storage statistics including HNSW index status Use when native Read/Write is wrong because you need (a) cross-session retrieval by semantic similarity (vector embeddings) not by file path, (b) namespacing across projects without managing directory layout, or (c) the .swarm/memory.db audit trail. For one-shot file I/O, native Read/Write is fine.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| dbPath | string | 아니오 | Database file to inspect; omitted uses the MCP store default | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "dbPath": {
      "type": "string",
      "description": "Database file to inspect; omitted uses the MCP store default"
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "memory_stats",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## memory_migrate

출처: Ruflo 원본

### 기능과 사용 시점

Manually trigger migration from legacy JSON store to sql.js Use when native Read/Write is wrong because you need (a) cross-session retrieval by semantic similarity (vector embeddings) not by file path, (b) namespacing across projects without managing directory layout, or (c) the .swarm/memory.db audit trail. For one-shot file I/O, native Read/Write is fine.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| force | boolean | 아니오 | Force re-migration even if already done | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "force": {
      "type": "boolean",
      "description": "Force re-migration even if already done"
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "memory_migrate",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## memory_import_claude

출처: Ruflo 원본

### 기능과 사용 시점

Import Claude Code auto-memory files into AgentDB with ONNX vector embeddings. Reads ~/.claude/projects/*/memory/*.md files, parses YAML frontmatter, splits into sections, and stores with 384-dim embeddings for semantic search. Use allProjects=true to import from ALL Claude projects. Pass projectPath to override cwd-based detection (#1883 — required when Ruflo runs in WSL but Claude Code is on Windows). Pass excludeFilePatterns (glob list) or excludeFiles (absolute path list) to skip voice-load-bearing, PII, or persona-restricted files (#1937). Use when native Read/Write is wrong because you need (a) cross-session retrieval by semantic similarity (vector embeddings) not by file path, (b) namespacing across projects without managing directory layout, or (c) the .swarm/memory.db audit trail. For one-shot file I/O, native Read/Write is fine.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| allProjects | boolean | 아니오 | Import from all Claude projects (default: current project only) | — |
| namespace | string | 아니오 | Target namespace (default: "claude-memories") | — |
| projectPath | string | 아니오 | #1883 — explicit project path to hash, used when cwd does not match Claude Code's view (e.g. WSL bridge to Windows host). Pass the canonical project root as Claude Code sees it. | — |
| excludeFilePatterns | array | 아니오 | #1937 — glob patterns matched against the absolute file path. Files matching ANY pattern are skipped. Supports `*` (any chars within a path segment), `**` (any chars including separators), and `?` (single char). Examples: `**/voice-*.md`, `**/persona-*.md`. Combine with excludeFiles for explicit paths. | — |
| excludeFiles | array | 아니오 | #1937 — absolute file paths to skip verbatim. Faster than a pattern when the list is known ahead of time (operator captured baselines). Combine with excludeFilePatterns. | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "allProjects": {
      "type": "boolean",
      "description": "Import from all Claude projects (default: current project only)"
    },
    "namespace": {
      "type": "string",
      "description": "Target namespace (default: \"claude-memories\")"
    },
    "projectPath": {
      "type": "string",
      "description": "#1883 — explicit project path to hash, used when cwd does not match Claude Code's view (e.g. WSL bridge to Windows host). Pass the canonical project root as Claude Code sees it."
    },
    "excludeFilePatterns": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "#1937 — glob patterns matched against the absolute file path. Files matching ANY pattern are skipped. Supports `*` (any chars within a path segment), `**` (any chars including separators), and `?` (single char). Examples: `**/voice-*.md`, `**/persona-*.md`. Combine with excludeFiles for explicit paths."
    },
    "excludeFiles": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "#1937 — absolute file paths to skip verbatim. Faster than a pattern when the list is known ahead of time (operator captured baselines). Combine with excludeFilePatterns."
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "memory_import_claude",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## memory_bridge_status

출처: Ruflo 원본

### 기능과 사용 시점

Show Claude Code memory bridge status — AgentDB vectors, SONA learning, intelligence patterns, and connection health. Use when native Read/Write is wrong because you need (a) cross-session retrieval by semantic similarity (vector embeddings) not by file path, (b) namespacing across projects without managing directory layout, or (c) the .swarm/memory.db audit trail. For one-shot file I/O, native Read/Write is fine.

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
  "name": "memory_bridge_status",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## memory_search_unified

출처: Ruflo 원본

### 기능과 사용 시점

Search across both Claude Code memories and AgentDB entries using semantic vector similarity. Returns merged, deduplicated results from all namespaces. Use when native Read/Write is wrong because you need (a) cross-session retrieval by semantic similarity (vector embeddings) not by file path, (b) namespacing across projects without managing directory layout, or (c) the .swarm/memory.db audit trail. For one-shot file I/O, native Read/Write is fine.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| query | string | 예 | Search query (natural language) | — |
| limit | number | 아니오 | Max results (default: 10) | — |
| namespace | string | 아니오 | Filter to a single namespace (mutually exclusive with `namespaces`) | — |
| namespaces | array | 아니오 | Explicit list of namespaces to fan out across (overrides defaults and env) | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "query": {
      "type": "string",
      "description": "Search query (natural language)"
    },
    "limit": {
      "type": "number",
      "description": "Max results (default: 10)"
    },
    "namespace": {
      "type": "string",
      "description": "Filter to a single namespace (mutually exclusive with `namespaces`)"
    },
    "namespaces": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Explicit list of namespaces to fan out across (overrides defaults and env)"
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
  "name": "memory_search_unified",
  "arguments": {
    "query": "<query 입력>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## memory_detailed-stats

출처: Ruflo 원본

### 기능과 사용 시점

Detailed memory-store report — backend, entry count, total bytes, per-namespace counts, and (placeholder) perf metrics. Use when native Read/Glob is wrong because the data lives in .swarm/memory.db, not files, and you want an aggregate health view. For a quick count use memory_stats; for "what is in memory" use memory_list.

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
  "name": "memory_detailed-stats",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## memory_cleanup

출처: Ruflo 원본

### 기능과 사용 시점

Prune memory entries whose TTL has expired (dry run by default; pass dryRun:false to delete). Use when native rm is wrong because the entries are rows in .swarm/memory.db, not files. For removing a specific known key use memory_delete. Stale/low-quality pruning is delegated to the agentdb consolidation curator (#1916 follow-up).

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| dryRun | boolean | 아니오 | Only report candidates, do not delete (default true) | — |
| namespace | string | 아니오 | Limit cleanup to one namespace | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "dryRun": {
      "type": "boolean",
      "description": "Only report candidates, do not delete (default true)"
    },
    "namespace": {
      "type": "string",
      "description": "Limit cleanup to one namespace"
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "memory_cleanup",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## memory_compress

출처: Ruflo 원본

### 기능과 사용 시점

Report memory-store size breakdown (the sql.js backend has no on-disk compression — entries are already stored compactly; quantized embeddings via RaBitQ are configured elsewhere). Use when native du is wrong because the data is in .swarm/memory.db. For pruning expired entries use memory_cleanup.

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
  "name": "memory_compress",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## memory_export

출처: Ruflo 원본

### 기능과 사용 시점

Export memory entries to a JSON file (keys, namespaces, timestamps, and values when available). Use when native Write is wrong because the data is rows in .swarm/memory.db, not a file you can copy. For ingesting an export elsewhere use memory_import. (CSV output and embedding-vector export are follow-ups.)

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| outputPath | string | 예 | File path to write the JSON export to | — |
| format | string | 아니오 | Export format (csv falls back to json today) | {"enum":["json","csv"]} |
| namespace | string | 아니오 | Limit export to one namespace | — |
| includeVectors | boolean | 아니오 | Include embedding vectors (advisory — not exported yet) | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "outputPath": {
      "type": "string",
      "description": "File path to write the JSON export to"
    },
    "format": {
      "type": "string",
      "enum": [
        "json",
        "csv"
      ],
      "description": "Export format (csv falls back to json today)"
    },
    "namespace": {
      "type": "string",
      "description": "Limit export to one namespace"
    },
    "includeVectors": {
      "type": "boolean",
      "description": "Include embedding vectors (advisory — not exported yet)"
    }
  },
  "required": [
    "outputPath"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "memory_export",
  "arguments": {
    "outputPath": "/absolute/path/my-project"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## memory_import

출처: Ruflo 원본

### 기능과 사용 시점

Import memory entries from a JSON export file (produced by memory_export) into .swarm/memory.db, re-embedding values. Use when native Read is wrong because the data must be re-stored as memory rows (with new embeddings), not just read. For importing Claude Code's own memory files use memory_import_claude. Pair with memory_export on the source.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| inputPath | string | 예 | Path to the JSON export file | — |
| merge | boolean | 아니오 | Merge into existing entries (upsert) vs. fail on conflict (default true) | — |
| namespace | string | 아니오 | Override the namespace for all imported entries | — |
| dbPath | string | 아니오 | Database file to import into (defaults to the MCP memory store) | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "inputPath": {
      "type": "string",
      "description": "Path to the JSON export file"
    },
    "merge": {
      "type": "boolean",
      "description": "Merge into existing entries (upsert) vs. fail on conflict (default true)"
    },
    "namespace": {
      "type": "string",
      "description": "Override the namespace for all imported entries"
    },
    "dbPath": {
      "type": "string",
      "description": "Database file to import into (defaults to the MCP memory store)"
    }
  },
  "required": [
    "inputPath"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "memory_import",
  "arguments": {
    "inputPath": "/absolute/path/my-project"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.
