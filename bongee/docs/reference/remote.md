# 원격 실행기 관리

[전체 목차](../MANUAL.md) · [사용 순서](../WORKFLOWS.md)

- [bongee_remote_provider_status](#bongee_remote_provider_status)
- [bongee_remote_agent_start](#bongee_remote_agent_start)
- [bongee_remote_agent_status](#bongee_remote_agent_status)
- [bongee_remote_agent_result](#bongee_remote_agent_result)
- [bongee_remote_agent_cancel](#bongee_remote_agent_cancel)
- [bongee_remote_agent_list](#bongee_remote_agent_list)

## bongee_remote_provider_status

출처: Bongee 원격 관리

### 기능과 사용 시점

로컬 실행기의 기존 CLI 로그인 상태

### 연결·실행 조건

Codex 또는 Claude CLI 설치와 기존 로그인. remote 도구는 게이트웨이 연결 권한과 켜진 로컬 실행기가 필요합니다. 읽기 조회에는 모델 실행이 필요하지 않을 수 있습니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| 없음 | — | — | 이름 있는 입력 필드 없음; 아래 스키마 확인 | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {},
  "required": [],
  "additionalProperties": false
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "bongee_remote_provider_status",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## bongee_remote_agent_start

출처: Bongee 원격 관리

### 기능과 사용 시점

로컬 실행기에 에이전트 작업 전달. 기본 읽기 전용.

### 연결·실행 조건

Codex 또는 Claude CLI 설치와 기존 로그인. remote 도구는 게이트웨이 연결 권한과 켜진 로컬 실행기가 필요합니다. 읽기 조회에는 모델 실행이 필요하지 않을 수 있습니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| provider | string | 예 | — | {"enum":["codex","claude"]} |
| prompt | string | 예 | — | {"minLength":1,"maxLength":100000} |
| cwd | string | 예 | — | {"minLength":1,"maxLength":4096} |
| mode | string | 아니오 | — | {"enum":["read-only","workspace-write"],"default":"read-only"} |
| timeoutSeconds | integer | 아니오 | — | {"minimum":1,"maximum":600,"default":180} |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "provider": {
      "type": "string",
      "enum": [
        "codex",
        "claude"
      ]
    },
    "prompt": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100000
    },
    "cwd": {
      "type": "string",
      "minLength": 1,
      "maxLength": 4096
    },
    "mode": {
      "type": "string",
      "enum": [
        "read-only",
        "workspace-write"
      ],
      "default": "read-only"
    },
    "timeoutSeconds": {
      "type": "integer",
      "minimum": 1,
      "maximum": 600,
      "default": 180
    }
  },
  "required": [
    "provider",
    "prompt",
    "cwd"
  ],
  "additionalProperties": false
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "bongee_remote_agent_start",
  "arguments": {
    "provider": "codex",
    "prompt": "<prompt 입력>",
    "cwd": "/absolute/path/my-project"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## bongee_remote_agent_status

출처: Bongee 원격 관리

### 기능과 사용 시점

로컬 에이전트 상태·결과·취소

### 연결·실행 조건

Codex 또는 Claude CLI 설치와 기존 로그인. remote 도구는 게이트웨이 연결 권한과 켜진 로컬 실행기가 필요합니다. 읽기 조회에는 모델 실행이 필요하지 않을 수 있습니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| id | string | 예 | — | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string"
    }
  },
  "required": [
    "id"
  ],
  "additionalProperties": false
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "bongee_remote_agent_status",
  "arguments": {
    "id": "<앞 단계에서 받은 ID>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## bongee_remote_agent_result

출처: Bongee 원격 관리

### 기능과 사용 시점

로컬 에이전트 상태·결과·취소

### 연결·실행 조건

Codex 또는 Claude CLI 설치와 기존 로그인. remote 도구는 게이트웨이 연결 권한과 켜진 로컬 실행기가 필요합니다. 읽기 조회에는 모델 실행이 필요하지 않을 수 있습니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| id | string | 예 | — | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string"
    }
  },
  "required": [
    "id"
  ],
  "additionalProperties": false
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "bongee_remote_agent_result",
  "arguments": {
    "id": "<앞 단계에서 받은 ID>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## bongee_remote_agent_cancel

출처: Bongee 원격 관리

### 기능과 사용 시점

로컬 에이전트 상태·결과·취소

### 연결·실행 조건

Codex 또는 Claude CLI 설치와 기존 로그인. remote 도구는 게이트웨이 연결 권한과 켜진 로컬 실행기가 필요합니다. 읽기 조회에는 모델 실행이 필요하지 않을 수 있습니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| id | string | 예 | — | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string"
    }
  },
  "required": [
    "id"
  ],
  "additionalProperties": false
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "bongee_remote_agent_cancel",
  "arguments": {
    "id": "<앞 단계에서 받은 ID>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## bongee_remote_agent_list

출처: Bongee 원격 관리

### 기능과 사용 시점

현재 서버의 최근 작업 목록

### 연결·실행 조건

Codex 또는 Claude CLI 설치와 기존 로그인. remote 도구는 게이트웨이 연결 권한과 켜진 로컬 실행기가 필요합니다. 읽기 조회에는 모델 실행이 필요하지 않을 수 있습니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| 없음 | — | — | 이름 있는 입력 필드 없음; 아래 스키마 확인 | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {},
  "required": [],
  "additionalProperties": false
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "bongee_remote_agent_list",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.
