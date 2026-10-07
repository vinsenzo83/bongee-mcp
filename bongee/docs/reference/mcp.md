# MCP 서버 관리

[전체 목차](../MANUAL.md) · [사용 순서](../WORKFLOWS.md)

- [mcp_status](#mcp_status)
- [mcp_start](#mcp_start)
- [mcp_stop](#mcp_stop)

## mcp_status

출처: Ruflo 원본

### 기능과 사용 시점

Get MCP server status, including stdio mode detection Use when native Claude Code MCP status is wrong because you need Ruflo-side server detail — tool counts per namespace, transport stats, MCP handshake errors. For just "is MCP up?", `claude mcp list` is fine.

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
  "name": "mcp_status",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## mcp_start

출처: Ruflo 원본

### 기능과 사용 시점

Report that the in-process MCP toolset is available (no-op "start" — if this tool responds, MCP is up). Use when native `claude mcp list` is wrong because you want Ruflo-side confirmation that the in-process registry loaded. For a standalone stdio/HTTP MCP server, run `ruflo mcp start` (a process command, not this tool). Pair with mcp_status for detail.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| port | number | 아니오 | Port (advisory — in-process MCP has no port) | — |
| transport | string | 아니오 | Transport (advisory) | — |
| tools | array | 아니오 | Tool namespaces (advisory — all are loaded) | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "port": {
      "type": "number",
      "description": "Port (advisory — in-process MCP has no port)"
    },
    "transport": {
      "type": "string",
      "description": "Transport (advisory)"
    },
    "tools": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Tool namespaces (advisory — all are loaded)"
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "mcp_start",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## mcp_stop

출처: Ruflo 원본

### 기능과 사용 시점

No-op "stop" for the in-process MCP toolset (there is no separate server process to stop from inside an MCP call). Use when native process-kill is wrong because you mistakenly think Ruflo runs a daemon — it does not, the tools live in the CLI process. To stop a standalone server run `ruflo mcp stop` or terminate that process. Pair with mcp_status.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| graceful | boolean | 아니오 | Advisory (no-op) | — |
| timeout | number | 아니오 | Advisory (no-op) | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "graceful": {
      "type": "boolean",
      "description": "Advisory (no-op)"
    },
    "timeout": {
      "type": "number",
      "description": "Advisory (no-op)"
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "mcp_stop",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.
