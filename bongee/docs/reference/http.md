# HTTP 요청

[전체 목차](../MANUAL.md) · [사용 순서](../WORKFLOWS.md)

- [http_fetch](#http_fetch)

## http_fetch

출처: Ruflo 원본

### 기능과 사용 시점

ADR-164 §5.1.8 — HTTP probe primitive for business-pod ops benches (synthetic 200/500 endpoint checks, third-party status pages). Default-secure: blocks file://, ftp://, RFC-1918 / loopback / link-local hosts unless CLAUDE_FLOW_HTTP_FETCH_ALLOW_PRIVATE=1, and rejects Authorization / Cookie / X-Auth-* headers unless CLAUDE_FLOW_HTTP_FETCH_ALLOW_AUTH=1. Hard 30s timeout (60s ceiling), response truncated to 256 KB (1 MB ceiling), default User-Agent ruflo-http-fetch/1.0. Use when a pod or smoke contract needs a guarded HTTP probe — calling Node fetch() directly is wrong because it skips the URL allowlist and header sanitization that ADR-164 mandates for autopilot mode. Pair with the ops-pod bench in plugins/ruflo-business-pods/templates/ops.json (the §4.4 synthetic-endpoint test).

### 연결·실행 조건

해당 원본 외부 서비스/네트워크/서명·계정 설정을 따릅니다. BATON 대체 기능은 별도 도구이며 원본 호출의 의미를 바꾸지 않습니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| url | string | 예 | Absolute http:// or https:// URL. file://, ftp://, RFC-1918 / loopback / link-local blocked by default. | — |
| method | string | 아니오 | HTTP method. Defaults to GET. | {"enum":["GET","POST","HEAD"]} |
| timeoutMs | number | 아니오 | Hard timeout in milliseconds. Default 30000, max 60000. | — |
| maxResponseBytes | number | 아니오 | Max body bytes to read before truncation. Default 262144 (256 KB), max 1048576 (1 MB). | — |
| headers | object | 아니오 | Extra request headers. Authorization / Cookie / X-Auth-* blocked unless CLAUDE_FLOW_HTTP_FETCH_ALLOW_AUTH=1. | — |
| body | string | 아니오 | Request body for POST. Ignored for GET / HEAD. | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "url": {
      "type": "string",
      "description": "Absolute http:// or https:// URL. file://, ftp://, RFC-1918 / loopback / link-local blocked by default."
    },
    "method": {
      "type": "string",
      "enum": [
        "GET",
        "POST",
        "HEAD"
      ],
      "description": "HTTP method. Defaults to GET."
    },
    "timeoutMs": {
      "type": "number",
      "description": "Hard timeout in milliseconds. Default 30000, max 60000."
    },
    "maxResponseBytes": {
      "type": "number",
      "description": "Max body bytes to read before truncation. Default 262144 (256 KB), max 1048576 (1 MB)."
    },
    "headers": {
      "type": "object",
      "description": "Extra request headers. Authorization / Cookie / X-Auth-* blocked unless CLAUDE_FLOW_HTTP_FETCH_ALLOW_AUTH=1."
    },
    "body": {
      "type": "string",
      "description": "Request body for POST. Ignored for GET / HEAD."
    }
  },
  "required": [
    "url"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "http_fetch",
  "arguments": {
    "url": "https://example.com"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.
