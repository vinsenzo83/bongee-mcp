# 패턴·플러그인·IPFS 연동

[전체 목차](../MANUAL.md) · [사용 순서](../WORKFLOWS.md)

- [transfer_detect-pii](#transfer_detect-pii)
- [transfer_ipfs-resolve](#transfer_ipfs-resolve)
- [transfer_store-search](#transfer_store-search)
- [transfer_store-info](#transfer_store-info)
- [transfer_store-download](#transfer_store-download)
- [transfer_store-featured](#transfer_store-featured)
- [transfer_store-trending](#transfer_store-trending)
- [transfer_plugin-search](#transfer_plugin-search)
- [transfer_plugin-info](#transfer_plugin-info)
- [transfer_plugin-featured](#transfer_plugin-featured)
- [transfer_plugin-official](#transfer_plugin-official)

## transfer_detect-pii

출처: Ruflo 원본

### 기능과 사용 시점

Detect PII in content without redacting Use when native package install (`npm i`, `pip install`) is wrong because the artifact lives on IPFS (plugins, witness chains, learned patterns). For npm-registry deps, native npm is fine.

### 연결·실행 조건

해당 원본 외부 서비스/네트워크/서명·계정 설정을 따릅니다. BATON 대체 기능은 별도 도구이며 원본 호출의 의미를 바꾸지 않습니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| content | string | 예 | Content to scan for PII | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "content": {
      "type": "string",
      "description": "Content to scan for PII"
    }
  },
  "required": [
    "content"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "transfer_detect-pii",
  "arguments": {
    "content": "<content 입력>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## transfer_ipfs-resolve

출처: Ruflo 원본

### 기능과 사용 시점

Resolve IPNS name to CID Use when native package install (`npm i`, `pip install`) is wrong because the artifact lives on IPFS (plugins, witness chains, learned patterns). For npm-registry deps, native npm is fine.

### 연결·실행 조건

해당 원본 외부 서비스/네트워크/서명·계정 설정을 따릅니다. BATON 대체 기능은 별도 도구이며 원본 호출의 의미를 바꾸지 않습니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| name | string | 예 | IPNS name to resolve | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "IPNS name to resolve"
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
  "name": "transfer_ipfs-resolve",
  "arguments": {
    "name": "<name 입력>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## transfer_store-search

출처: Ruflo 원본

### 기능과 사용 시점

Search the pattern store Use when native package install (`npm i`, `pip install`) is wrong because the artifact lives on IPFS (plugins, witness chains, learned patterns). For npm-registry deps, native npm is fine.

### 연결·실행 조건

해당 원본 외부 서비스/네트워크/서명·계정 설정을 따릅니다. BATON 대체 기능은 별도 도구이며 원본 호출의 의미를 바꾸지 않습니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| query | string | 아니오 | Search query | — |
| category | string | 아니오 | Filter by category | — |
| minRating | number | 아니오 | Minimum rating | — |
| verified | boolean | 아니오 | Only show verified patterns | — |
| limit | number | 아니오 | Maximum results | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "query": {
      "type": "string",
      "description": "Search query"
    },
    "category": {
      "type": "string",
      "description": "Filter by category"
    },
    "minRating": {
      "type": "number",
      "description": "Minimum rating"
    },
    "verified": {
      "type": "boolean",
      "description": "Only show verified patterns"
    },
    "limit": {
      "type": "number",
      "description": "Maximum results"
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "transfer_store-search",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## transfer_store-info

출처: Ruflo 원본

### 기능과 사용 시점

Get detailed info about a pattern Use when native package install (`npm i`, `pip install`) is wrong because the artifact lives on IPFS (plugins, witness chains, learned patterns). For npm-registry deps, native npm is fine.

### 연결·실행 조건

해당 원본 외부 서비스/네트워크/서명·계정 설정을 따릅니다. BATON 대체 기능은 별도 도구이며 원본 호출의 의미를 바꾸지 않습니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| id | string | 예 | Pattern ID | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "description": "Pattern ID"
    }
  },
  "required": [
    "id"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "transfer_store-info",
  "arguments": {
    "id": "<앞 단계에서 받은 ID>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## transfer_store-download

출처: Ruflo 원본

### 기능과 사용 시점

Download a pattern from the store Use when native package install (`npm i`, `pip install`) is wrong because the artifact lives on IPFS (plugins, witness chains, learned patterns). For npm-registry deps, native npm is fine.

### 연결·실행 조건

해당 원본 외부 서비스/네트워크/서명·계정 설정을 따릅니다. BATON 대체 기능은 별도 도구이며 원본 호출의 의미를 바꾸지 않습니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| id | string | 예 | Pattern ID | — |
| verify | boolean | 아니오 | Verify pattern integrity | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "description": "Pattern ID"
    },
    "verify": {
      "type": "boolean",
      "description": "Verify pattern integrity"
    }
  },
  "required": [
    "id"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "transfer_store-download",
  "arguments": {
    "id": "<앞 단계에서 받은 ID>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## transfer_store-featured

출처: Ruflo 원본

### 기능과 사용 시점

Get featured patterns from the store Use when native package install (`npm i`, `pip install`) is wrong because the artifact lives on IPFS (plugins, witness chains, learned patterns). For npm-registry deps, native npm is fine.

### 연결·실행 조건

해당 원본 외부 서비스/네트워크/서명·계정 설정을 따릅니다. BATON 대체 기능은 별도 도구이며 원본 호출의 의미를 바꾸지 않습니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| limit | number | 아니오 | Maximum results | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "limit": {
      "type": "number",
      "description": "Maximum results"
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "transfer_store-featured",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## transfer_store-trending

출처: Ruflo 원본

### 기능과 사용 시점

Get trending patterns from the store Use when native package install (`npm i`, `pip install`) is wrong because the artifact lives on IPFS (plugins, witness chains, learned patterns). For npm-registry deps, native npm is fine.

### 연결·실행 조건

해당 원본 외부 서비스/네트워크/서명·계정 설정을 따릅니다. BATON 대체 기능은 별도 도구이며 원본 호출의 의미를 바꾸지 않습니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| limit | number | 아니오 | Maximum results | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "limit": {
      "type": "number",
      "description": "Maximum results"
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "transfer_store-trending",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## transfer_plugin-search

출처: Ruflo 원본

### 기능과 사용 시점

Search the plugin store Use when native package install (`npm i`, `pip install`) is wrong because the artifact lives on IPFS (plugins, witness chains, learned patterns). For npm-registry deps, native npm is fine.

### 연결·실행 조건

해당 원본 외부 서비스/네트워크/서명·계정 설정을 따릅니다. BATON 대체 기능은 별도 도구이며 원본 호출의 의미를 바꾸지 않습니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| query | string | 아니오 | Search query | — |
| category | string | 아니오 | Filter by category | — |
| type | string | 아니오 | Filter by plugin type | — |
| verified | boolean | 아니오 | Only show verified plugins | — |
| minRating | number | 아니오 | Minimum rating | — |
| limit | number | 아니오 | Maximum results | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "query": {
      "type": "string",
      "description": "Search query"
    },
    "category": {
      "type": "string",
      "description": "Filter by category"
    },
    "type": {
      "type": "string",
      "description": "Filter by plugin type"
    },
    "verified": {
      "type": "boolean",
      "description": "Only show verified plugins"
    },
    "minRating": {
      "type": "number",
      "description": "Minimum rating"
    },
    "limit": {
      "type": "number",
      "description": "Maximum results"
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "transfer_plugin-search",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## transfer_plugin-info

출처: Ruflo 원본

### 기능과 사용 시점

Get detailed info about a plugin Use when native package install (`npm i`, `pip install`) is wrong because the artifact lives on IPFS (plugins, witness chains, learned patterns). For npm-registry deps, native npm is fine.

### 연결·실행 조건

해당 원본 외부 서비스/네트워크/서명·계정 설정을 따릅니다. BATON 대체 기능은 별도 도구이며 원본 호출의 의미를 바꾸지 않습니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| name | string | 예 | Plugin name or ID | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "Plugin name or ID"
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
  "name": "transfer_plugin-info",
  "arguments": {
    "name": "<name 입력>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## transfer_plugin-featured

출처: Ruflo 원본

### 기능과 사용 시점

Get featured plugins from the store Use when native package install (`npm i`, `pip install`) is wrong because the artifact lives on IPFS (plugins, witness chains, learned patterns). For npm-registry deps, native npm is fine.

### 연결·실행 조건

해당 원본 외부 서비스/네트워크/서명·계정 설정을 따릅니다. BATON 대체 기능은 별도 도구이며 원본 호출의 의미를 바꾸지 않습니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| limit | number | 아니오 | Maximum results | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "limit": {
      "type": "number",
      "description": "Maximum results"
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "transfer_plugin-featured",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## transfer_plugin-official

출처: Ruflo 원본

### 기능과 사용 시점

Get official plugins from the store Use when native package install (`npm i`, `pip install`) is wrong because the artifact lives on IPFS (plugins, witness chains, learned patterns). For npm-registry deps, native npm is fine.

### 연결·실행 조건

해당 원본 외부 서비스/네트워크/서명·계정 설정을 따릅니다. BATON 대체 기능은 별도 도구이며 원본 호출의 의미를 바꾸지 않습니다.

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
  "name": "transfer_plugin-official",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.
