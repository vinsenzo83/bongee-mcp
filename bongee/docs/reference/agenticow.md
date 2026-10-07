# 기억 분기·병합

[전체 목차](../MANUAL.md) · [사용 순서](../WORKFLOWS.md)

- [agenticow_branch](#agenticow_branch)
- [agenticow_ingest](#agenticow_ingest)
- [agenticow_query](#agenticow_query)
- [agenticow_diff](#agenticow_diff)
- [agenticow_lineage](#agenticow_lineage)
- [agenticow_status](#agenticow_status)
- [agenticow_checkpoint](#agenticow_checkpoint)
- [agenticow_rollback](#agenticow_rollback)
- [agenticow_promote](#agenticow_promote)
- [agenticow_speculate](#agenticow_speculate)

## agenticow_branch

출처: Ruflo 원본

### 기능과 사용 시점

agenticow@~0.2.3 — COW-fork a base .rvf memory file. Measured 162-byte branches regardless of base size (verified at N=1k/10k/50k). Use when you need per-Darwin-iteration / per-user / per-session memory personalization. Copying the parent .rvf file is wrong because full-copy snapshots grow linearly (the 3.3 GB Darwin-worktree bloat fixed in v3.14.4); agenticow gives read-through semantics (parent ∪ edits, child wins) at constant 162 B. Optional dep — degrades to {degraded:true} when missing.

### 연결·실행 조건

원본의 선택적 DB·WASM·벡터/모델 패키지와 데이터가 필요할 수 있습니다. 초기 패키지·모델 다운로드와 실제 기능 사용 가능 여부를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| basePath | string | 예 | Path to base .rvf memory file (absolute or relative to cwd) | — |
| branchPath | string | 예 | Path to write the branch file | — |
| label | string | 예 | Human-readable label for the branch (alnum + _.-:/@ only) | — |
| dimension | integer | 아니오 | Vector dimension (required only when basePath does not exist yet) | — |
| nativeAnn | boolean | 아니오 | Use the native Rust COW dual-graph ANN path (recall@10=1.0, query spans the COW boundary in one Rust call). Default false (exact JS chain-walk). Set true when the branch will be queried. | {"default":false} |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "basePath": {
      "type": "string",
      "description": "Path to base .rvf memory file (absolute or relative to cwd)"
    },
    "branchPath": {
      "type": "string",
      "description": "Path to write the branch file"
    },
    "label": {
      "type": "string",
      "description": "Human-readable label for the branch (alnum + _.-:/@ only)"
    },
    "dimension": {
      "type": "integer",
      "description": "Vector dimension (required only when basePath does not exist yet)"
    },
    "nativeAnn": {
      "type": "boolean",
      "description": "Use the native Rust COW dual-graph ANN path (recall@10=1.0, query spans the COW boundary in one Rust call). Default false (exact JS chain-walk). Set true when the branch will be queried.",
      "default": false
    }
  },
  "required": [
    "basePath",
    "branchPath",
    "label"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "agenticow_branch",
  "arguments": {
    "basePath": "/absolute/path/my-project",
    "branchPath": "/absolute/path/my-project",
    "label": "<label 입력>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## agenticow_ingest

출처: Ruflo 원본

### 기능과 사용 시점

agenticow — write vectors (with optional text payloads) into an .rvf memory branch or base. Records: [{id?, vector, text?}] — id auto-assigns when omitted. This is the write half that makes a branch usable: agenticow_branch creates an empty COW child, but without ingest it has nothing to read back. Use when you have branched and must populate the branch (agenticow_branch alone leaves it empty). Editing the base directly is wrong when the writes are speculative — ingest into a branch, then promote only if validated. Persists via .agenticow.json lineage manifest.

### 연결·실행 조건

원본의 선택적 DB·WASM·벡터/모델 패키지와 데이터가 필요할 수 있습니다. 초기 패키지·모델 다운로드와 실제 기능 사용 가능 여부를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| path | string | 예 | Path to .rvf memory file (branch or base) | — |
| records | array | 예 | Vectors to ingest: [{id?: number, vector: number[], text?: string}] | — |
| records[].id | integer | 아니오 | Explicit id (auto-assigned when omitted) | — |
| records[].vector | array | 예 (상위 제공 시) | Embedding vector (length must equal the memory dimension) | — |
| records[].text | string | 아니오 | Optional payload surfaced on query hits | — |
| dimension | integer | 아니오 | Vector dimension (required only when path does not exist yet) | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "path": {
      "type": "string",
      "description": "Path to .rvf memory file (branch or base)"
    },
    "records": {
      "type": "array",
      "description": "Vectors to ingest: [{id?: number, vector: number[], text?: string}]",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "integer",
            "description": "Explicit id (auto-assigned when omitted)"
          },
          "vector": {
            "type": "array",
            "items": {
              "type": "number"
            },
            "description": "Embedding vector (length must equal the memory dimension)"
          },
          "text": {
            "type": "string",
            "description": "Optional payload surfaced on query hits"
          }
        },
        "required": [
          "vector"
        ]
      }
    },
    "dimension": {
      "type": "integer",
      "description": "Vector dimension (required only when path does not exist yet)"
    }
  },
  "required": [
    "path",
    "records"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "agenticow_ingest",
  "arguments": {
    "path": "/absolute/path/my-project",
    "records": [
      {
        "vector": [
          1
        ]
      }
    ]
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## agenticow_query

출처: Ruflo 원본

### 기능과 사용 시점

agenticow — k-NN read across an .rvf memory branch's full COW lineage (parent ∪ edits, child wins), returning {id, distance, branch, text}. Read-only (no manifest write). The `branch` field on each hit tells you which lineage node the result came from — the read-through semantics that make branching useful. Use when you need to read from an agent/session branch without materializing a full copy. Re-opening the base and manually merging edits is wrong: query already spans the chain (and uses the single-call Rust path when the branch was forked with nativeAnn).

### 연결·실행 조건

원본의 선택적 DB·WASM·벡터/모델 패키지와 데이터가 필요할 수 있습니다. 초기 패키지·모델 다운로드와 실제 기능 사용 가능 여부를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| path | string | 예 | Path to .rvf memory file | — |
| vector | array | 예 | Query embedding vector | — |
| k | integer | 아니오 | Number of nearest neighbors to return | {"default":10} |
| efSearch | integer | 아니오 | HNSW efSearch per lineage store (higher = better recall, slower) | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "path": {
      "type": "string",
      "description": "Path to .rvf memory file"
    },
    "vector": {
      "type": "array",
      "items": {
        "type": "number"
      },
      "description": "Query embedding vector"
    },
    "k": {
      "type": "integer",
      "description": "Number of nearest neighbors to return",
      "default": 10
    },
    "efSearch": {
      "type": "integer",
      "description": "HNSW efSearch per lineage store (higher = better recall, slower)"
    }
  },
  "required": [
    "path",
    "vector"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "agenticow_query",
  "arguments": {
    "path": "/absolute/path/my-project",
    "vector": [
      1
    ]
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## agenticow_diff

출처: Ruflo 원본

### 기능과 사용 시점

agenticow — show what a branch changed relative to its lineage: {added, overridden, deleted} vector-id lists. Use when you are about to promote and want to preview the exact merge, or when auditing what a branch actually wrote. Diffing by re-querying is wrong because deletions (tombstones) are invisible to a read — diff() surfaces them explicitly. Requires the branch was opened with edit tracking (default on).

### 연결·실행 조건

원본의 선택적 DB·WASM·벡터/모델 패키지와 데이터가 필요할 수 있습니다. 초기 패키지·모델 다운로드와 실제 기능 사용 가능 여부를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| path | string | 예 | Path to branch .rvf file | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "path": {
      "type": "string",
      "description": "Path to branch .rvf file"
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
  "name": "agenticow_diff",
  "arguments": {
    "path": "/absolute/path/my-project"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## agenticow_lineage

출처: Ruflo 원본

### 기능과 사용 시점

agenticow — walk the COW chain of an .rvf memory file: an ordered list of nodes (role working|checkpoint|base, id, label, parent, createdAt, mutations, tombstones). Use when you need branch history — to find checkpoint ids for a targeted rollback, or to debug a promote. Guessing the chain from filenames is wrong — lineage is the authoritative structure the store maintains.

### 연결·실행 조건

원본의 선택적 DB·WASM·벡터/모델 패키지와 데이터가 필요할 수 있습니다. 초기 패키지·모델 다운로드와 실제 기능 사용 가능 여부를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| path | string | 예 | Path to .rvf memory file | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "path": {
      "type": "string",
      "description": "Path to .rvf memory file"
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
  "name": "agenticow_lineage",
  "arguments": {
    "path": "/absolute/path/my-project"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## agenticow_status

출처: Ruflo 원본

### 기능과 사용 시점

agenticow — health/geometry of an .rvf memory file: {totalVectors, totalSegments, fileSize, currentEpoch, deadSpaceRatio, readOnly, chainDepth, dimension, metric}. Use when you need to check vector count before/after ingest, spot compaction pressure (deadSpaceRatio), or confirm the dimension before ingesting into a shared base. Pure read.

### 연결·실행 조건

원본의 선택적 DB·WASM·벡터/모델 패키지와 데이터가 필요할 수 있습니다. 초기 패키지·모델 다운로드와 실제 기능 사용 가능 여부를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| path | string | 예 | Path to .rvf memory file | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "path": {
      "type": "string",
      "description": "Path to .rvf memory file"
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
  "name": "agenticow_status",
  "arguments": {
    "path": "/absolute/path/my-project"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## agenticow_checkpoint

출처: Ruflo 원본

### 기능과 사용 시점

agenticow — freeze a labelled restore point on an .rvf memory file. Subsequent edits stay in a fresh COW child; rollback returns here. Use when you are about to run an experimental Darwin tick or speculative agent edit that may need to be discarded. Relying on the working node alone is wrong because there is no "undo last N writes" semantics — without a checkpoint, a bad ingest contaminates the base. Persists via .agenticow.json lineage manifest so it survives close+reopen.

### 연결·실행 조건

원본의 선택적 DB·WASM·벡터/모델 패키지와 데이터가 필요할 수 있습니다. 초기 패키지·모델 다운로드와 실제 기능 사용 가능 여부를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| path | string | 예 | Path to .rvf memory file | — |
| label | string | 예 | Checkpoint label (alnum + _.-:/@ only) | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "path": {
      "type": "string",
      "description": "Path to .rvf memory file"
    },
    "label": {
      "type": "string",
      "description": "Checkpoint label (alnum + _.-:/@ only)"
    }
  },
  "required": [
    "path",
    "label"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "agenticow_checkpoint",
  "arguments": {
    "path": "/absolute/path/my-project",
    "label": "<label 입력>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## agenticow_rollback

출처: Ruflo 원본

### 기능과 사용 시점

agenticow — discard all edits since the most recent checkpoint on an .rvf memory file. Reuses a fresh COW child derived from the checkpoint. Use when a Darwin tick or agent experiment regressed and you want to revert memory state without re-running. Deleting+rebuilding the .rvf is wrong because rebuild cost is O(N) and the data after the bad point is lost; rollback is O(edits-since-checkpoint) and the earlier history stays intact via the lineage manifest.

### 연결·실행 조건

원본의 선택적 DB·WASM·벡터/모델 패키지와 데이터가 필요할 수 있습니다. 초기 패키지·모델 다운로드와 실제 기능 사용 가능 여부를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| path | string | 예 | Path to .rvf memory file | — |
| checkpointId | string | 아니오 | Target checkpoint id from agenticow_lineage (omit to roll back to the most recent checkpoint) | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "path": {
      "type": "string",
      "description": "Path to .rvf memory file"
    },
    "checkpointId": {
      "type": "string",
      "description": "Target checkpoint id from agenticow_lineage (omit to roll back to the most recent checkpoint)"
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
  "name": "agenticow_rollback",
  "arguments": {
    "path": "/absolute/path/my-project"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## agenticow_promote

출처: Ruflo 원본

### 기능과 사용 시점

agenticow — merge a branch's edits back into its base (or an explicit target) memory file. After promote, branch edits become part of base lineage. Use when a per-user / per-Darwin-iteration branch has been validated and should graduate to shared memory (federation merge, A/B winner). Manually re-ingesting edits into the base is wrong because the edit set is opaque to the caller and tombstones (deletions) are easily missed; promote applies the full edit + tombstone set atomically.

### 연결·실행 조건

원본의 선택적 DB·WASM·벡터/모델 패키지와 데이터가 필요할 수 있습니다. 초기 패키지·모델 다운로드와 실제 기능 사용 가능 여부를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| branchPath | string | 예 | Path to branch .rvf file | — |
| basePath | string | 아니오 | Path to base .rvf file. When omitted, promote merges into the recorded fork parent (most common case). | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "branchPath": {
      "type": "string",
      "description": "Path to branch .rvf file"
    },
    "basePath": {
      "type": "string",
      "description": "Path to base .rvf file. When omitted, promote merges into the recorded fork parent (most common case)."
    }
  },
  "required": [
    "branchPath"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "agenticow_promote",
  "arguments": {
    "branchPath": "/absolute/path/my-project"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## agenticow_speculate

출처: Ruflo 원본

### 기능과 사용 시점

agenticow — speculative branch-and-promote for parallel A/B memory exploration. Forks a 162-byte COW branch per candidate off a shared base .rvf, ingests each candidate's vectors into its OWN isolated branch, scores every branch (probe-query 'nearest' distance or ingest 'count'), PROMOTES the winning branch's edits into base, and DISCARDS the losers by deleting their branch files. Use when you want to try N competing memory-write strategies and keep only the best — the memory-state analogue of worktree-per-agent code exploration. Copying the base per candidate is wrong (full-copy snapshots grow linearly, the 3.3 GB Darwin bloat); COW forks are constant-size and losers cost ~162 B to throw away. Optional dep — degrades to {degraded:true} when agenticow is missing.

### 연결·실행 조건

원본의 선택적 DB·WASM·벡터/모델 패키지와 데이터가 필요할 수 있습니다. 초기 패키지·모델 다운로드와 실제 기능 사용 가능 여부를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| basePath | string | 예 | Path to base .rvf memory file (absolute or relative to cwd) | — |
| dimension | integer | 아니오 | Vector dimension (required only when basePath does not exist yet) | — |
| candidates | array | 예 | The A/B candidates. Each explores its own COW branch. | — |
| candidates[].label | string | 예 (상위 제공 시) | Branch label (alnum + _.-:/@ only) | — |
| candidates[].ingest | array | 예 (상위 제공 시) | Vectors to ingest into this candidate branch | — |
| candidates[].ingest[].id | integer | 아니오 | Explicit vector id (auto when omitted) | — |
| candidates[].ingest[].vector | array | 예 (상위 제공 시) | Dense vector | — |
| candidates[].ingest[].text | string | 아니오 | Optional payload text | — |
| candidates[].branchPath | string | 아니오 | Optional explicit path for this branch file (default: alongside base) | — |
| probe | array | 아니오 | Probe vector for scoreBy='nearest' (scores each branch by best-hit similarity) | — |
| k | integer | 아니오 | Nearest-neighbours to fetch per probe (default 1) | — |
| scoreBy | string | 아니오 | 'nearest' = closest probe distance wins; 'count' = most accepted ingests wins. Default 'nearest'. | {"enum":["nearest","count"]} |
| requireClearance | boolean | 아니오 | ADR-171 fail-closed gate. When true, the top-scored winner is NOT promoted (base stays unchanged) and a provenance-tagged receipt is emitted — score alone cannot graduate work. Use when speculating over TASK outcomes rather than pure memory A/B. Default false (score-only promotion, tagged `unverified`). | {"default":false} |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "basePath": {
      "type": "string",
      "description": "Path to base .rvf memory file (absolute or relative to cwd)"
    },
    "dimension": {
      "type": "integer",
      "description": "Vector dimension (required only when basePath does not exist yet)"
    },
    "candidates": {
      "type": "array",
      "description": "The A/B candidates. Each explores its own COW branch.",
      "items": {
        "type": "object",
        "properties": {
          "label": {
            "type": "string",
            "description": "Branch label (alnum + _.-:/@ only)"
          },
          "ingest": {
            "type": "array",
            "description": "Vectors to ingest into this candidate branch",
            "items": {
              "type": "object",
              "properties": {
                "id": {
                  "type": "integer",
                  "description": "Explicit vector id (auto when omitted)"
                },
                "vector": {
                  "type": "array",
                  "items": {
                    "type": "number"
                  },
                  "description": "Dense vector"
                },
                "text": {
                  "type": "string",
                  "description": "Optional payload text"
                }
              },
              "required": [
                "vector"
              ]
            }
          },
          "branchPath": {
            "type": "string",
            "description": "Optional explicit path for this branch file (default: alongside base)"
          }
        },
        "required": [
          "label",
          "ingest"
        ]
      }
    },
    "probe": {
      "type": "array",
      "items": {
        "type": "number"
      },
      "description": "Probe vector for scoreBy='nearest' (scores each branch by best-hit similarity)"
    },
    "k": {
      "type": "integer",
      "description": "Nearest-neighbours to fetch per probe (default 1)"
    },
    "scoreBy": {
      "type": "string",
      "enum": [
        "nearest",
        "count"
      ],
      "description": "'nearest' = closest probe distance wins; 'count' = most accepted ingests wins. Default 'nearest'."
    },
    "requireClearance": {
      "type": "boolean",
      "description": "ADR-171 fail-closed gate. When true, the top-scored winner is NOT promoted (base stays unchanged) and a provenance-tagged receipt is emitted — score alone cannot graduate work. Use when speculating over TASK outcomes rather than pure memory A/B. Default false (score-only promotion, tagged `unverified`).",
      "default": false
    }
  },
  "required": [
    "basePath",
    "candidates"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "agenticow_speculate",
  "arguments": {
    "basePath": "/absolute/path/my-project",
    "candidates": [
      {
        "label": "<label 입력>",
        "ingest": [
          {
            "vector": [
              1
            ]
          }
        ]
      }
    ]
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.
