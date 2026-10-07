# 신경망 학습·추론

[전체 목차](../MANUAL.md) · [사용 순서](../WORKFLOWS.md)

- [neural_train](#neural_train)
- [neural_predict](#neural_predict)
- [neural_patterns](#neural_patterns)
- [neural_compress](#neural_compress)
- [neural_status](#neural_status)
- [neural_optimize](#neural_optimize)

## neural_train

출처: Ruflo 원본

### 기능과 사용 시점

Train a neural model Use when nothing native trains on your workflow — Claude Code has no learning loop. Use to train SONA/MoE/EWC patterns from successful task outcomes; query via neural_predict before spawning agents. Off-path for one-shot work.

### 연결·실행 조건

원본의 선택적 DB·WASM·벡터/모델 패키지와 데이터가 필요할 수 있습니다. 초기 패키지·모델 다운로드와 실제 기능 사용 가능 여부를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| modelId | string | 아니오 | Model ID to train | — |
| modelType | string | 예 | Model type | {"enum":["moe","transformer","classifier","embedding"]} |
| epochs | number | 아니오 | Number of training epochs | — |
| learningRate | number | 아니오 | Learning rate | — |
| data | object | 아니오 | Training data | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "modelId": {
      "type": "string",
      "description": "Model ID to train"
    },
    "modelType": {
      "type": "string",
      "enum": [
        "moe",
        "transformer",
        "classifier",
        "embedding"
      ],
      "description": "Model type"
    },
    "epochs": {
      "type": "number",
      "description": "Number of training epochs"
    },
    "learningRate": {
      "type": "number",
      "description": "Learning rate"
    },
    "data": {
      "type": "object",
      "description": "Training data"
    }
  },
  "required": [
    "modelType"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "neural_train",
  "arguments": {
    "modelType": "moe"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## neural_predict

출처: Ruflo 원본

### 기능과 사용 시점

Make predictions using a neural model Use when nothing native trains on your workflow — Claude Code has no learning loop. Use to train SONA/MoE/EWC patterns from successful task outcomes; query via neural_predict before spawning agents. Off-path for one-shot work.

### 연결·실행 조건

원본의 선택적 DB·WASM·벡터/모델 패키지와 데이터가 필요할 수 있습니다. 초기 패키지·모델 다운로드와 실제 기능 사용 가능 여부를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| modelId | string | 아니오 | Model ID to use | — |
| input | string | 예 | Input text or data | — |
| topK | number | 아니오 | Number of top predictions | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "modelId": {
      "type": "string",
      "description": "Model ID to use"
    },
    "input": {
      "type": "string",
      "description": "Input text or data"
    },
    "topK": {
      "type": "number",
      "description": "Number of top predictions"
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
  "name": "neural_predict",
  "arguments": {
    "input": "<input 입력>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## neural_patterns

출처: Ruflo 원본

### 기능과 사용 시점

Get or manage neural patterns Use when nothing native trains on your workflow — Claude Code has no learning loop. Use to train SONA/MoE/EWC patterns from successful task outcomes; query via neural_predict before spawning agents. Off-path for one-shot work.

### 연결·실행 조건

원본의 선택적 DB·WASM·벡터/모델 패키지와 데이터가 필요할 수 있습니다. 초기 패키지·모델 다운로드와 실제 기능 사용 가능 여부를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| action | string | 아니오 | Action to perform | {"enum":["list","get","store","search","delete"]} |
| patternId | string | 아니오 | Pattern ID | — |
| name | string | 아니오 | Pattern name | — |
| type | string | 아니오 | Pattern type | — |
| content | string | 아니오 | Pattern source text (used for BM25 in hybrid search; falls back to name) | — |
| query | string | 아니오 | Search query | — |
| limit | number | 아니오 | Top-K results to return (default 10, max 100) | — |
| mode | string | 아니오 | Search mode — hybrid (cosine+BM25+MMR, default) or cosine (pre-3.10.18 behaviour, for A/B) | {"enum":["hybrid","cosine"]} |
| alpha | number | 아니오 | Hybrid: cosine weight in [0,1]; (1-α) is BM25 weight (default 0.5, tuned ADR-082) | — |
| mmrLambda | number | 아니오 | Hybrid: MMR balance — 1.0 = pure relevance, 0.0 = pure diversity (default 0.7, tuned ADR-082) | — |
| subjectWeight | number | 아니오 | Hybrid: multi-field BM25 weight for subject/name (default 2.0 non-rerank, 3.0 with rerank — tuned ADR-082/083) | — |
| bodyWeight | number | 아니오 | Hybrid: multi-field BM25 weight for body/content (default 1.0) | — |
| typePenaltyFactor | number | 아니오 | Hybrid: meta-commit score multiplier — release/merge/bump commits × this factor (default 1.0 = disabled; set 0.5 for aggressive suppression) | — |
| rerank | boolean | 아니오 | Hybrid: opt-in cross-encoder rerank pass over the top-K (ADR-080). Adds ~20-40 ms per (query, doc) pair; first call downloads ~30MB model. Gracefully degrades to hybrid+MMR order when unavailable. | — |
| hybridWeight | number | 아니오 | Rerank: hybrid score weight in final combination (default 0.7, tuned ADR-083) | — |
| ceWeight | number | 아니오 | Rerank: cross-encoder score weight in final combination (default 0.3, tuned ADR-083) | — |
| data | object | 아니오 | Pattern data | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "action": {
      "type": "string",
      "enum": [
        "list",
        "get",
        "store",
        "search",
        "delete"
      ],
      "description": "Action to perform"
    },
    "patternId": {
      "type": "string",
      "description": "Pattern ID"
    },
    "name": {
      "type": "string",
      "description": "Pattern name"
    },
    "type": {
      "type": "string",
      "description": "Pattern type"
    },
    "content": {
      "type": "string",
      "description": "Pattern source text (used for BM25 in hybrid search; falls back to name)"
    },
    "query": {
      "type": "string",
      "description": "Search query"
    },
    "limit": {
      "type": "number",
      "description": "Top-K results to return (default 10, max 100)"
    },
    "mode": {
      "type": "string",
      "enum": [
        "hybrid",
        "cosine"
      ],
      "description": "Search mode — hybrid (cosine+BM25+MMR, default) or cosine (pre-3.10.18 behaviour, for A/B)"
    },
    "alpha": {
      "type": "number",
      "description": "Hybrid: cosine weight in [0,1]; (1-α) is BM25 weight (default 0.5, tuned ADR-082)"
    },
    "mmrLambda": {
      "type": "number",
      "description": "Hybrid: MMR balance — 1.0 = pure relevance, 0.0 = pure diversity (default 0.7, tuned ADR-082)"
    },
    "subjectWeight": {
      "type": "number",
      "description": "Hybrid: multi-field BM25 weight for subject/name (default 2.0 non-rerank, 3.0 with rerank — tuned ADR-082/083)"
    },
    "bodyWeight": {
      "type": "number",
      "description": "Hybrid: multi-field BM25 weight for body/content (default 1.0)"
    },
    "typePenaltyFactor": {
      "type": "number",
      "description": "Hybrid: meta-commit score multiplier — release/merge/bump commits × this factor (default 1.0 = disabled; set 0.5 for aggressive suppression)"
    },
    "rerank": {
      "type": "boolean",
      "description": "Hybrid: opt-in cross-encoder rerank pass over the top-K (ADR-080). Adds ~20-40 ms per (query, doc) pair; first call downloads ~30MB model. Gracefully degrades to hybrid+MMR order when unavailable."
    },
    "hybridWeight": {
      "type": "number",
      "description": "Rerank: hybrid score weight in final combination (default 0.7, tuned ADR-083)"
    },
    "ceWeight": {
      "type": "number",
      "description": "Rerank: cross-encoder score weight in final combination (default 0.3, tuned ADR-083)"
    },
    "data": {
      "type": "object",
      "description": "Pattern data"
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "neural_patterns",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## neural_compress

출처: Ruflo 원본

### 기능과 사용 시점

Compress neural model or embeddings Use when nothing native trains on your workflow — Claude Code has no learning loop. Use to train SONA/MoE/EWC patterns from successful task outcomes; query via neural_predict before spawning agents. Off-path for one-shot work.

### 연결·실행 조건

원본의 선택적 DB·WASM·벡터/모델 패키지와 데이터가 필요할 수 있습니다. 초기 패키지·모델 다운로드와 실제 기능 사용 가능 여부를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| modelId | string | 아니오 | Model ID to compress | — |
| method | string | 아니오 | Compression method | {"enum":["quantize","prune","distill"]} |
| targetSize | number | 아니오 | Target size reduction (0-1) | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "modelId": {
      "type": "string",
      "description": "Model ID to compress"
    },
    "method": {
      "type": "string",
      "enum": [
        "quantize",
        "prune",
        "distill"
      ],
      "description": "Compression method"
    },
    "targetSize": {
      "type": "number",
      "description": "Target size reduction (0-1)"
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "neural_compress",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## neural_status

출처: Ruflo 원본

### 기능과 사용 시점

Get neural system status Use when nothing native trains on your workflow — Claude Code has no learning loop. Use to train SONA/MoE/EWC patterns from successful task outcomes; query via neural_predict before spawning agents. Off-path for one-shot work.

### 연결·실행 조건

원본의 선택적 DB·WASM·벡터/모델 패키지와 데이터가 필요할 수 있습니다. 초기 패키지·모델 다운로드와 실제 기능 사용 가능 여부를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| modelId | string | 아니오 | Specific model ID | — |
| detailed | boolean | 아니오 | Include detailed info | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "modelId": {
      "type": "string",
      "description": "Specific model ID"
    },
    "detailed": {
      "type": "boolean",
      "description": "Include detailed info"
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "neural_status",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## neural_optimize

출처: Ruflo 원본

### 기능과 사용 시점

Optimize neural model performance Use when nothing native trains on your workflow — Claude Code has no learning loop. Use to train SONA/MoE/EWC patterns from successful task outcomes; query via neural_predict before spawning agents. Off-path for one-shot work.

### 연결·실행 조건

원본의 선택적 DB·WASM·벡터/모델 패키지와 데이터가 필요할 수 있습니다. 초기 패키지·모델 다운로드와 실제 기능 사용 가능 여부를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| modelId | string | 아니오 | Model ID to optimize | — |
| target | string | 아니오 | Optimization target | {"enum":["speed","memory","accuracy","balanced"]} |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "modelId": {
      "type": "string",
      "description": "Model ID to optimize"
    },
    "target": {
      "type": "string",
      "enum": [
        "speed",
        "memory",
        "accuracy",
        "balanced"
      ],
      "description": "Optimization target"
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "neural_optimize",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.
