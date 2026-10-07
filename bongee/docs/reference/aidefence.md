# 입력 방어·개인정보 검사

[전체 목차](../MANUAL.md) · [사용 순서](../WORKFLOWS.md)

- [aidefence_scan](#aidefence_scan)
- [aidefence_analyze](#aidefence_analyze)
- [aidefence_stats](#aidefence_stats)
- [aidefence_learn](#aidefence_learn)
- [aidefence_is_safe](#aidefence_is_safe)
- [aidefence_has_pii](#aidefence_has_pii)

## aidefence_scan

출처: Ruflo 원본

### 기능과 사용 시점

Scan input text for AI manipulation threats (prompt injection, jailbreaks, PII). Returns threat assessment with <10ms latency. Use when nothing native exists — Claude Code does not have a PII / prompt-injection / adversarial-text scanner. Pair with any tool that ingests untrusted input (browser scrape, federation envelope, memory_import_claude).

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| input | string | 예 | Text to scan for threats | — |
| quick | boolean | 아니오 | Quick scan mode (faster, less detailed) | {"default":false} |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "input": {
      "type": "string",
      "description": "Text to scan for threats"
    },
    "quick": {
      "type": "boolean",
      "description": "Quick scan mode (faster, less detailed)",
      "default": false
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
  "name": "aidefence_scan",
  "arguments": {
    "input": "<input 입력>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## aidefence_analyze

출처: Ruflo 원본

### 기능과 사용 시점

Deep analysis of input for specific threat types with similar pattern search and mitigation recommendations. Use when nothing native exists — Claude Code does not have a PII / prompt-injection / adversarial-text scanner. Pair with any tool that ingests untrusted input (browser scrape, federation envelope, memory_import_claude).

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| input | string | 예 | Text to analyze | — |
| searchSimilar | boolean | 아니오 | Search for similar known threats | {"default":true} |
| k | number | 아니오 | Number of similar patterns to retrieve | {"default":5} |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "input": {
      "type": "string",
      "description": "Text to analyze"
    },
    "searchSimilar": {
      "type": "boolean",
      "description": "Search for similar known threats",
      "default": true
    },
    "k": {
      "type": "number",
      "description": "Number of similar patterns to retrieve",
      "default": 5
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
  "name": "aidefence_analyze",
  "arguments": {
    "input": "<input 입력>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## aidefence_stats

출처: Ruflo 원본

### 기능과 사용 시점

Get AIDefence detection and learning statistics. Use when nothing native exists — Claude Code does not have a PII / prompt-injection / adversarial-text scanner. Pair with any tool that ingests untrusted input (browser scrape, federation envelope, memory_import_claude).

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
  "name": "aidefence_stats",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## aidefence_learn

출처: Ruflo 원본

### 기능과 사용 시점

Record detection feedback for pattern learning. Improves future detection accuracy. Use when nothing native exists — Claude Code does not have a PII / prompt-injection / adversarial-text scanner. Pair with any tool that ingests untrusted input (browser scrape, federation envelope, memory_import_claude).

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| input | string | 예 | Original input that was scanned | — |
| wasAccurate | boolean | 예 | Whether the detection was accurate | — |
| verdict | string | 아니오 | User verdict or correction | — |
| threatType | string | 아니오 | Threat type for mitigation recording | — |
| mitigationStrategy | string | 아니오 | Mitigation strategy used | {"enum":["block","sanitize","warn","log","escalate","transform","redirect"]} |
| mitigationSuccess | boolean | 아니오 | Whether the mitigation was successful | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "input": {
      "type": "string",
      "description": "Original input that was scanned"
    },
    "wasAccurate": {
      "type": "boolean",
      "description": "Whether the detection was accurate"
    },
    "verdict": {
      "type": "string",
      "description": "User verdict or correction"
    },
    "threatType": {
      "type": "string",
      "description": "Threat type for mitigation recording"
    },
    "mitigationStrategy": {
      "type": "string",
      "description": "Mitigation strategy used",
      "enum": [
        "block",
        "sanitize",
        "warn",
        "log",
        "escalate",
        "transform",
        "redirect"
      ]
    },
    "mitigationSuccess": {
      "type": "boolean",
      "description": "Whether the mitigation was successful"
    }
  },
  "required": [
    "input",
    "wasAccurate"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "aidefence_learn",
  "arguments": {
    "input": "<input 입력>",
    "wasAccurate": false
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## aidefence_is_safe

출처: Ruflo 원본

### 기능과 사용 시점

Quick boolean check if input is safe. Fastest option for simple validation. Use when nothing native exists — Claude Code does not have a PII / prompt-injection / adversarial-text scanner. Pair with any tool that ingests untrusted input (browser scrape, federation envelope, memory_import_claude).

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| input | string | 예 | Text to check | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "input": {
      "type": "string",
      "description": "Text to check"
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
  "name": "aidefence_is_safe",
  "arguments": {
    "input": "<input 입력>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## aidefence_has_pii

출처: Ruflo 원본

### 기능과 사용 시점

Check if input contains PII (emails, SSNs, API keys, passwords, etc.). Use when nothing native exists — Claude Code does not have a PII / prompt-injection / adversarial-text scanner. Pair with any tool that ingests untrusted input (browser scrape, federation envelope, memory_import_claude).

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| input | string | 예 | Text to check for PII | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "input": {
      "type": "string",
      "description": "Text to check for PII"
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
  "name": "aidefence_has_pii",
  "arguments": {
    "input": "<input 입력>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.
