# 로컬 모델·벡터 라우팅

[전체 목차](../MANUAL.md) · [사용 순서](../WORKFLOWS.md)

- [ruvllm_status](#ruvllm_status)
- [ruvllm_hnsw_create](#ruvllm_hnsw_create)
- [ruvllm_hnsw_add](#ruvllm_hnsw_add)
- [ruvllm_hnsw_route](#ruvllm_hnsw_route)
- [ruvllm_sona_create](#ruvllm_sona_create)
- [ruvllm_sona_adapt](#ruvllm_sona_adapt)
- [ruvllm_microlora_create](#ruvllm_microlora_create)
- [ruvllm_microlora_adapt](#ruvllm_microlora_adapt)
- [ruvllm_chat_format](#ruvllm_chat_format)
- [ruvllm_generate_config](#ruvllm_generate_config)

## ruvllm_status

출처: Ruflo 원본

### 기능과 사용 시점

Get ruvllm-wasm availability and initialization status. Use when sending every prompt to the Anthropic API is wrong because you need local inference — air-gapped environments, MicroLoRA-fine-tuned per-task adapters, or sub-cent per-call cost. For general Claude work native Task is the right call.

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
  "name": "ruvllm_status",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## ruvllm_hnsw_create

출처: Ruflo 원본

### 기능과 사용 시점

Create a WASM HNSW router for semantic pattern routing. Max ~11 patterns (v2.0.1 limit). Use when sending every prompt to the Anthropic API is wrong because you need local inference — air-gapped environments, MicroLoRA-fine-tuned per-task adapters, or sub-cent per-call cost. For general Claude work native Task is the right call.

### 연결·실행 조건

원본의 선택적 DB·WASM·벡터/모델 패키지와 데이터가 필요할 수 있습니다. 초기 패키지·모델 다운로드와 실제 기능 사용 가능 여부를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| dimensions | number | 예 | Embedding dimensions (e.g., 64, 128, 384) | — |
| maxPatterns | number | 예 | Max patterns capacity (limit ~11 in v2.0.1) | — |
| efSearch | number | 아니오 | HNSW ef search parameter (higher = more accurate, slower) | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "dimensions": {
      "type": "number",
      "description": "Embedding dimensions (e.g., 64, 128, 384)"
    },
    "maxPatterns": {
      "type": "number",
      "description": "Max patterns capacity (limit ~11 in v2.0.1)"
    },
    "efSearch": {
      "type": "number",
      "description": "HNSW ef search parameter (higher = more accurate, slower)"
    }
  },
  "required": [
    "dimensions",
    "maxPatterns"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "ruvllm_hnsw_create",
  "arguments": {
    "dimensions": 1,
    "maxPatterns": 1
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## ruvllm_hnsw_add

출처: Ruflo 원본

### 기능과 사용 시점

Add a pattern to an HNSW router. Embedding must match router dimensions. Use when sending every prompt to the Anthropic API is wrong because you need local inference — air-gapped environments, MicroLoRA-fine-tuned per-task adapters, or sub-cent per-call cost. For general Claude work native Task is the right call.

### 연결·실행 조건

원본의 선택적 DB·WASM·벡터/모델 패키지와 데이터가 필요할 수 있습니다. 초기 패키지·모델 다운로드와 실제 기능 사용 가능 여부를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| routerId | string | 예 | HNSW router ID from ruvllm_hnsw_create | — |
| name | string | 예 | Pattern name/label | — |
| embedding | array | 예 | Float array embedding vector | — |
| metadata | object | 아니오 | Optional metadata object | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "routerId": {
      "type": "string",
      "description": "HNSW router ID from ruvllm_hnsw_create"
    },
    "name": {
      "type": "string",
      "description": "Pattern name/label"
    },
    "embedding": {
      "type": "array",
      "items": {
        "type": "number"
      },
      "description": "Float array embedding vector"
    },
    "metadata": {
      "type": "object",
      "description": "Optional metadata object"
    }
  },
  "required": [
    "routerId",
    "name",
    "embedding"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "ruvllm_hnsw_add",
  "arguments": {
    "routerId": "<앞 단계에서 받은 ID>",
    "name": "<name 입력>",
    "embedding": [
      1
    ]
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## ruvllm_hnsw_route

출처: Ruflo 원본

### 기능과 사용 시점

Route a query embedding to nearest patterns in HNSW index. Use when sending every prompt to the Anthropic API is wrong because you need local inference — air-gapped environments, MicroLoRA-fine-tuned per-task adapters, or sub-cent per-call cost. For general Claude work native Task is the right call.

### 연결·실행 조건

원본의 선택적 DB·WASM·벡터/모델 패키지와 데이터가 필요할 수 있습니다. 초기 패키지·모델 다운로드와 실제 기능 사용 가능 여부를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| routerId | string | 예 | HNSW router ID | — |
| query | array | 예 | Query embedding vector | — |
| k | number | 아니오 | Number of nearest neighbors (default: 3) | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "routerId": {
      "type": "string",
      "description": "HNSW router ID"
    },
    "query": {
      "type": "array",
      "items": {
        "type": "number"
      },
      "description": "Query embedding vector"
    },
    "k": {
      "type": "number",
      "description": "Number of nearest neighbors (default: 3)"
    }
  },
  "required": [
    "routerId",
    "query"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "ruvllm_hnsw_route",
  "arguments": {
    "routerId": "<앞 단계에서 받은 ID>",
    "query": [
      1
    ]
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## ruvllm_sona_create

출처: Ruflo 원본

### 기능과 사용 시점

Create a SONA instant adaptation loop (<1ms adaptation cycles). Use when sending every prompt to the Anthropic API is wrong because you need local inference — air-gapped environments, MicroLoRA-fine-tuned per-task adapters, or sub-cent per-call cost. For general Claude work native Task is the right call.

### 연결·실행 조건

원본의 선택적 DB·WASM·벡터/모델 패키지와 데이터가 필요할 수 있습니다. 초기 패키지·모델 다운로드와 실제 기능 사용 가능 여부를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| hiddenDim | number | 아니오 | Hidden dimension (default: 64) | — |
| learningRate | number | 아니오 | Learning rate (default: 0.01) | — |
| patternCapacity | number | 아니오 | Max stored patterns | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "hiddenDim": {
      "type": "number",
      "description": "Hidden dimension (default: 64)"
    },
    "learningRate": {
      "type": "number",
      "description": "Learning rate (default: 0.01)"
    },
    "patternCapacity": {
      "type": "number",
      "description": "Max stored patterns"
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "ruvllm_sona_create",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## ruvllm_sona_adapt

출처: Ruflo 원본

### 기능과 사용 시점

Run SONA instant adaptation with a quality signal. Use when sending every prompt to the Anthropic API is wrong because you need local inference — air-gapped environments, MicroLoRA-fine-tuned per-task adapters, or sub-cent per-call cost. For general Claude work native Task is the right call.

### 연결·실행 조건

원본의 선택적 DB·WASM·벡터/모델 패키지와 데이터가 필요할 수 있습니다. 초기 패키지·모델 다운로드와 실제 기능 사용 가능 여부를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| sonaId | string | 예 | SONA instance ID | — |
| quality | number | 예 | Quality signal (0.0-1.0) | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "sonaId": {
      "type": "string",
      "description": "SONA instance ID"
    },
    "quality": {
      "type": "number",
      "description": "Quality signal (0.0-1.0)"
    }
  },
  "required": [
    "sonaId",
    "quality"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "ruvllm_sona_adapt",
  "arguments": {
    "sonaId": "<앞 단계에서 받은 ID>",
    "quality": 1
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## ruvllm_microlora_create

출처: Ruflo 원본

### 기능과 사용 시점

Create a MicroLoRA adapter (ultra-lightweight LoRA, ranks 1-4). Use when sending every prompt to the Anthropic API is wrong because you need local inference — air-gapped environments, MicroLoRA-fine-tuned per-task adapters, or sub-cent per-call cost. For general Claude work native Task is the right call.

### 연결·실행 조건

원본의 선택적 DB·WASM·벡터/모델 패키지와 데이터가 필요할 수 있습니다. 초기 패키지·모델 다운로드와 실제 기능 사용 가능 여부를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| inputDim | number | 예 | Input dimension | — |
| outputDim | number | 예 | Output dimension | — |
| rank | number | 아니오 | LoRA rank (1-4, default: 2) | — |
| alpha | number | 아니오 | LoRA alpha scaling (default: 1.0) | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "inputDim": {
      "type": "number",
      "description": "Input dimension"
    },
    "outputDim": {
      "type": "number",
      "description": "Output dimension"
    },
    "rank": {
      "type": "number",
      "description": "LoRA rank (1-4, default: 2)"
    },
    "alpha": {
      "type": "number",
      "description": "LoRA alpha scaling (default: 1.0)"
    }
  },
  "required": [
    "inputDim",
    "outputDim"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "ruvllm_microlora_create",
  "arguments": {
    "inputDim": 1,
    "outputDim": 1
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## ruvllm_microlora_adapt

출처: Ruflo 원본

### 기능과 사용 시점

Adapt MicroLoRA weights with quality feedback. Use when sending every prompt to the Anthropic API is wrong because you need local inference — air-gapped environments, MicroLoRA-fine-tuned per-task adapters, or sub-cent per-call cost. For general Claude work native Task is the right call.

### 연결·실행 조건

원본의 선택적 DB·WASM·벡터/모델 패키지와 데이터가 필요할 수 있습니다. 초기 패키지·모델 다운로드와 실제 기능 사용 가능 여부를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| loraId | string | 예 | MicroLoRA instance ID | — |
| quality | number | 예 | Quality signal (0.0-1.0) | — |
| learningRate | number | 아니오 | Learning rate (default: 0.01) | — |
| success | boolean | 아니오 | Whether the adaptation was successful (default: true) | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "loraId": {
      "type": "string",
      "description": "MicroLoRA instance ID"
    },
    "quality": {
      "type": "number",
      "description": "Quality signal (0.0-1.0)"
    },
    "learningRate": {
      "type": "number",
      "description": "Learning rate (default: 0.01)"
    },
    "success": {
      "type": "boolean",
      "description": "Whether the adaptation was successful (default: true)"
    }
  },
  "required": [
    "loraId",
    "quality"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "ruvllm_microlora_adapt",
  "arguments": {
    "loraId": "<앞 단계에서 받은 ID>",
    "quality": 1
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## ruvllm_chat_format

출처: Ruflo 원본

### 기능과 사용 시점

Format chat messages using a template (llama3, mistral, chatml, phi, gemma, or auto-detect). Use when sending every prompt to the Anthropic API is wrong because you need local inference — air-gapped environments, MicroLoRA-fine-tuned per-task adapters, or sub-cent per-call cost. For general Claude work native Task is the right call.

### 연결·실행 조건

원본의 선택적 DB·WASM·벡터/모델 패키지와 데이터가 필요할 수 있습니다. 초기 패키지·모델 다운로드와 실제 기능 사용 가능 여부를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| messages | array | 예 | Array of {role, content} message objects | — |
| messages[].role | string | 예 (상위 제공 시) | — | — |
| messages[].content | string | 예 (상위 제공 시) | — | — |
| template | string | 예 | Template preset (llama3, mistral, chatml, phi, gemma) or model ID for auto-detection | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "messages": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "role": {
            "type": "string"
          },
          "content": {
            "type": "string"
          }
        },
        "required": [
          "role",
          "content"
        ]
      },
      "description": "Array of {role, content} message objects"
    },
    "template": {
      "type": "string",
      "description": "Template preset (llama3, mistral, chatml, phi, gemma) or model ID for auto-detection"
    }
  },
  "required": [
    "messages",
    "template"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "ruvllm_chat_format",
  "arguments": {
    "messages": [
      {
        "role": "<role 입력>",
        "content": "<content 입력>"
      }
    ],
    "template": "<template 입력>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## ruvllm_generate_config

출처: Ruflo 원본

### 기능과 사용 시점

Create a generation config (maxTokens, temperature, topP, etc.) as JSON. Use when sending every prompt to the Anthropic API is wrong because you need local inference — air-gapped environments, MicroLoRA-fine-tuned per-task adapters, or sub-cent per-call cost. For general Claude work native Task is the right call.

### 연결·실행 조건

원본의 선택적 DB·WASM·벡터/모델 패키지와 데이터가 필요할 수 있습니다. 초기 패키지·모델 다운로드와 실제 기능 사용 가능 여부를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| maxTokens | number | 아니오 | Max tokens to generate | — |
| temperature | number | 아니오 | Sampling temperature (note: f32 precision) | — |
| topP | number | 아니오 | Top-p sampling | — |
| topK | number | 아니오 | Top-k sampling | — |
| repetitionPenalty | number | 아니오 | Repetition penalty | — |
| stopSequences | array | 아니오 | Stop sequences | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "maxTokens": {
      "type": "number",
      "description": "Max tokens to generate"
    },
    "temperature": {
      "type": "number",
      "description": "Sampling temperature (note: f32 precision)"
    },
    "topP": {
      "type": "number",
      "description": "Top-p sampling"
    },
    "topK": {
      "type": "number",
      "description": "Top-k sampling"
    },
    "repetitionPenalty": {
      "type": "number",
      "description": "Repetition penalty"
    },
    "stopSequences": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Stop sequences"
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "ruvllm_generate_config",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.
