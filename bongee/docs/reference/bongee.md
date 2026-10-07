# Bongee 로그인 세션 실행

[전체 목차](../MANUAL.md) · [사용 순서](../WORKFLOWS.md)

- [bongee_pipeline_start](#bongee_pipeline_start)
- [bongee_pipeline_status](#bongee_pipeline_status)
- [bongee_pipeline_result](#bongee_pipeline_result)
- [bongee_pipeline_list](#bongee_pipeline_list)
- [bongee_pipeline_pause](#bongee_pipeline_pause)
- [bongee_pipeline_resume](#bongee_pipeline_resume)
- [bongee_pipeline_cancel](#bongee_pipeline_cancel)
- [bongee_baton_status](#bongee_baton_status)
- [bongee_provider_status](#bongee_provider_status)
- [bongee_agent_start](#bongee_agent_start)
- [bongee_agent_status](#bongee_agent_status)
- [bongee_agent_result](#bongee_agent_result)
- [bongee_agent_cancel](#bongee_agent_cancel)
- [bongee_agent_list](#bongee_agent_list)
- [bongee_monitor_status](#bongee_monitor_status)

## bongee_pipeline_start

출처: Bongee 추가

### 기능과 사용 시점

Automatically run actual planner+researcher → architect+designer → developer → real test commands+tester+reviewer. Handoff validated artifacts; repair and reverify failures. Returns pipeline ID immediately. Developer edits the target project. Separate CLI login sessions; not merely registry records.

### 연결·실행 조건

로컬 실행 기록/프로세스를 읽습니다. 조회 자체에는 AI API 키나 모델 호출이 필요하지 않습니다. provider_status는 CLI 설치·로그인 상태를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| cwd | string | 예 | Existing target project absolute path | — |
| request | string | 예 | Complete user goal and constraints | {"minLength":1,"maxLength":60000} |
| provider | string | 아니오 | — | {"enum":["codex","claude"]} |
| providers | object | 아니오 | — | {"required":[],"additionalProperties":false} |
| providers.planner | string | 아니오 | — | {"enum":["codex","claude"]} |
| providers.researcher | string | 아니오 | — | {"enum":["codex","claude"]} |
| providers.architect | string | 아니오 | — | {"enum":["codex","claude"]} |
| providers.designer | string | 아니오 | — | {"enum":["codex","claude"]} |
| providers.developer | string | 아니오 | — | {"enum":["codex","claude"]} |
| providers.tester | string | 아니오 | — | {"enum":["codex","claude"]} |
| providers.reviewer | string | 아니오 | — | {"enum":["codex","claude"]} |
| checks | array | 아니오 | — | {"maxItems":32} |
| checks[].id | string | 아니오 | — | — |
| checks[].label | string | 아니오 | — | — |
| checks[].command | string | 예 (상위 제공 시) | — | — |
| checks[].args | array | 예 (상위 제공 시) | — | — |
| maxRepairRounds | integer | 아니오 | — | {"minimum":0,"maximum":20,"default":3} |
| stageTimeoutSeconds | integer | 아니오 | — | {"minimum":1,"maximum":600,"default":600} |
| checkTimeoutSeconds | integer | 아니오 | — | {"minimum":1,"maximum":600,"default":300} |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "cwd": {
      "type": "string",
      "description": "Existing target project absolute path"
    },
    "request": {
      "type": "string",
      "minLength": 1,
      "maxLength": 60000,
      "description": "Complete user goal and constraints"
    },
    "provider": {
      "type": "string",
      "enum": [
        "codex",
        "claude"
      ]
    },
    "providers": {
      "type": "object",
      "properties": {
        "planner": {
          "type": "string",
          "enum": [
            "codex",
            "claude"
          ]
        },
        "researcher": {
          "type": "string",
          "enum": [
            "codex",
            "claude"
          ]
        },
        "architect": {
          "type": "string",
          "enum": [
            "codex",
            "claude"
          ]
        },
        "designer": {
          "type": "string",
          "enum": [
            "codex",
            "claude"
          ]
        },
        "developer": {
          "type": "string",
          "enum": [
            "codex",
            "claude"
          ]
        },
        "tester": {
          "type": "string",
          "enum": [
            "codex",
            "claude"
          ]
        },
        "reviewer": {
          "type": "string",
          "enum": [
            "codex",
            "claude"
          ]
        }
      },
      "required": [],
      "additionalProperties": false
    },
    "checks": {
      "type": "array",
      "maxItems": 32,
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "label": {
            "type": "string"
          },
          "command": {
            "type": "string"
          },
          "args": {
            "type": "array",
            "items": {
              "type": "string"
            }
          }
        },
        "required": [
          "command",
          "args"
        ],
        "additionalProperties": false
      }
    },
    "maxRepairRounds": {
      "type": "integer",
      "minimum": 0,
      "maximum": 20,
      "default": 3
    },
    "stageTimeoutSeconds": {
      "type": "integer",
      "minimum": 1,
      "maximum": 600,
      "default": 600
    },
    "checkTimeoutSeconds": {
      "type": "integer",
      "minimum": 1,
      "maximum": 600,
      "default": 300
    }
  },
  "required": [
    "cwd",
    "request"
  ],
  "additionalProperties": false
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "bongee_pipeline_start",
  "arguments": {
    "cwd": "/absolute/path/my-project",
    "request": "<request 입력>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## bongee_pipeline_status

출처: Bongee 추가

### 기능과 사용 시점

Read actual automatic pipeline progress, roles, rounds and reasons; no model invocation.

### 연결·실행 조건

로컬 실행 기록/프로세스를 읽습니다. 조회 자체에는 AI API 키나 모델 호출이 필요하지 않습니다. provider_status는 CLI 설치·로그인 상태를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| id | string | 예 | Pipeline ID returned by start | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "description": "Pipeline ID returned by start"
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
  "name": "bongee_pipeline_status",
  "arguments": {
    "id": "<앞 단계에서 받은 ID>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## bongee_pipeline_result

출처: Bongee 추가

### 기능과 사용 시점

Read pipeline artifacts, verification receipts, role history and final outcome. Start/completed agent text alone does not mean verified completion.

### 연결·실행 조건

로컬 실행 기록/프로세스를 읽습니다. 조회 자체에는 AI API 키나 모델 호출이 필요하지 않습니다. provider_status는 CLI 설치·로그인 상태를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| id | string | 예 | Pipeline ID returned by start | — |
| historyOffset | integer | 아니오 | — | {"minimum":0,"default":0} |
| historyLimit | integer | 아니오 | — | {"minimum":1,"maximum":10,"default":3} |
| includeCurrent | boolean | 아니오 | — | {"default":true} |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "description": "Pipeline ID returned by start"
    },
    "historyOffset": {
      "type": "integer",
      "minimum": 0,
      "default": 0
    },
    "historyLimit": {
      "type": "integer",
      "minimum": 1,
      "maximum": 10,
      "default": 3
    },
    "includeCurrent": {
      "type": "boolean",
      "default": true
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
  "name": "bongee_pipeline_result",
  "arguments": {
    "id": "<앞 단계에서 받은 ID>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## bongee_pipeline_list

출처: Bongee 추가

### 기능과 사용 시점

List persistent automatic pipeline jobs, optionally scoped to project.

### 연결·실행 조건

로컬 실행 기록/프로세스를 읽습니다. 조회 자체에는 AI API 키나 모델 호출이 필요하지 않습니다. provider_status는 CLI 설치·로그인 상태를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| cwd | string | 아니오 | — | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "cwd": {
      "type": "string"
    }
  },
  "required": [],
  "additionalProperties": false
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "bongee_pipeline_list",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## bongee_pipeline_pause

출처: Bongee 추가

### 기능과 사용 시점

Pause the automatic pipeline and stop active agent/check work. Already written files remain. Resume reruns uncertain work.

### 연결·실행 조건

로컬 실행 기록/프로세스를 읽습니다. 조회 자체에는 AI API 키나 모델 호출이 필요하지 않습니다. provider_status는 CLI 설치·로그인 상태를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| id | string | 예 | Pipeline ID returned by start | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "description": "Pipeline ID returned by start"
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
  "name": "bongee_pipeline_pause",
  "arguments": {
    "id": "<앞 단계에서 받은 ID>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## bongee_pipeline_resume

출처: Bongee 추가

### 기능과 사용 시점

Resume paused/interrupted/failed pipeline from confirmed artifacts; optionally change provider/checks/repair cap. Cannot seize a live owner or skip verification.

### 연결·실행 조건

로컬 실행 기록/프로세스를 읽습니다. 조회 자체에는 AI API 키나 모델 호출이 필요하지 않습니다. provider_status는 CLI 설치·로그인 상태를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| id | string | 예 | Pipeline ID returned by start | — |
| provider | string | 아니오 | — | {"enum":["codex","claude"]} |
| providers | object | 아니오 | — | {"required":[],"additionalProperties":false} |
| providers.planner | string | 아니오 | — | {"enum":["codex","claude"]} |
| providers.researcher | string | 아니오 | — | {"enum":["codex","claude"]} |
| providers.architect | string | 아니오 | — | {"enum":["codex","claude"]} |
| providers.designer | string | 아니오 | — | {"enum":["codex","claude"]} |
| providers.developer | string | 아니오 | — | {"enum":["codex","claude"]} |
| providers.tester | string | 아니오 | — | {"enum":["codex","claude"]} |
| providers.reviewer | string | 아니오 | — | {"enum":["codex","claude"]} |
| checks | array | 아니오 | — | {"maxItems":32} |
| checks[].id | string | 아니오 | — | — |
| checks[].label | string | 아니오 | — | — |
| checks[].command | string | 예 (상위 제공 시) | — | — |
| checks[].args | array | 예 (상위 제공 시) | — | — |
| maxRepairRounds | integer | 아니오 | — | {"minimum":0,"maximum":20,"default":3} |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "description": "Pipeline ID returned by start"
    },
    "provider": {
      "type": "string",
      "enum": [
        "codex",
        "claude"
      ]
    },
    "providers": {
      "type": "object",
      "properties": {
        "planner": {
          "type": "string",
          "enum": [
            "codex",
            "claude"
          ]
        },
        "researcher": {
          "type": "string",
          "enum": [
            "codex",
            "claude"
          ]
        },
        "architect": {
          "type": "string",
          "enum": [
            "codex",
            "claude"
          ]
        },
        "designer": {
          "type": "string",
          "enum": [
            "codex",
            "claude"
          ]
        },
        "developer": {
          "type": "string",
          "enum": [
            "codex",
            "claude"
          ]
        },
        "tester": {
          "type": "string",
          "enum": [
            "codex",
            "claude"
          ]
        },
        "reviewer": {
          "type": "string",
          "enum": [
            "codex",
            "claude"
          ]
        }
      },
      "required": [],
      "additionalProperties": false
    },
    "checks": {
      "type": "array",
      "maxItems": 32,
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "label": {
            "type": "string"
          },
          "command": {
            "type": "string"
          },
          "args": {
            "type": "array",
            "items": {
              "type": "string"
            }
          }
        },
        "required": [
          "command",
          "args"
        ],
        "additionalProperties": false
      }
    },
    "maxRepairRounds": {
      "type": "integer",
      "minimum": 0,
      "maximum": 20,
      "default": 3
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
  "name": "bongee_pipeline_resume",
  "arguments": {
    "id": "<앞 단계에서 받은 ID>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## bongee_pipeline_cancel

출처: Bongee 추가

### 기능과 사용 시점

Cancel pipeline and active agent/test processes. Does not revert files or external changes.

### 연결·실행 조건

로컬 실행 기록/프로세스를 읽습니다. 조회 자체에는 AI API 키나 모델 호출이 필요하지 않습니다. provider_status는 CLI 설치·로그인 상태를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| id | string | 예 | Pipeline ID returned by start | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "description": "Pipeline ID returned by start"
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
  "name": "bongee_pipeline_cancel",
  "arguments": {
    "id": "<앞 단계에서 받은 ID>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## bongee_baton_status

출처: Bongee 추가

### 기능과 사용 시점

Read BATON handoff/room connection status without writing.

### 연결·실행 조건

BATON 서버 네트워크 연결. 계정 권한은 아래 실제 스키마의 api_key 등 필수 여부를 따릅니다. 익명 연결 성공은 모든 관리 기능의 사용 권한을 뜻하지 않습니다.

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
  "name": "bongee_baton_status",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## bongee_provider_status

출처: Bongee 추가

### 기능과 사용 시점

Check existing Codex and Claude CLI login. No API credentials returned.

### 연결·실행 조건

로컬 실행 기록/프로세스를 읽습니다. 조회 자체에는 AI API 키나 모델 호출이 필요하지 않습니다. provider_status는 CLI 설치·로그인 상태를 확인합니다.

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
  "name": "bongee_provider_status",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## bongee_agent_start

출처: Bongee 추가

### 기능과 사용 시점

Execute a real Codex or Claude CLI agent with existing login. Default read-only. Poll status/result. New CLI session, not a copy of this conversation. Optional role/name/phase appear in the live four-stage monitor.

### 연결·실행 조건

Codex 또는 Claude CLI 설치와 기존 로그인이 필요합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| provider | string | 예 | — | {"enum":["codex","claude"]} |
| prompt | string | 예 | — | {"maxLength":100000} |
| cwd | string | 예 | — | — |
| role | string | 아니오 | Agent role, e.g. planner, designer, developer, tester, reviewer | {"maxLength":80} |
| name | string | 아니오 | Short display name; do not include secrets | {"maxLength":80} |
| phase | string | 아니오 | Display stage; does not automatically run a pipeline | {"enum":["planning","design","development","verification"]} |
| mode | string | 아니오 | — | {"enum":["read-only","workspace-write"],"default":"read-only"} |
| timeoutSeconds | integer | 아니오 | — | {"minimum":1,"maximum":600} |

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
      "maxLength": 100000
    },
    "cwd": {
      "type": "string"
    },
    "role": {
      "type": "string",
      "maxLength": 80,
      "description": "Agent role, e.g. planner, designer, developer, tester, reviewer"
    },
    "name": {
      "type": "string",
      "maxLength": 80,
      "description": "Short display name; do not include secrets"
    },
    "phase": {
      "type": "string",
      "enum": [
        "planning",
        "design",
        "development",
        "verification"
      ],
      "description": "Display stage; does not automatically run a pipeline"
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
      "maximum": 600
    }
  },
  "required": [
    "provider",
    "prompt",
    "cwd"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "bongee_agent_start",
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

## bongee_agent_status

출처: Bongee 추가

### 기능과 사용 시점

Read actual agent execution state.

### 연결·실행 조건

로컬 실행 기록/프로세스를 읽습니다. 조회 자체에는 AI API 키나 모델 호출이 필요하지 않습니다. provider_status는 CLI 설치·로그인 상태를 확인합니다.

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
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "bongee_agent_status",
  "arguments": {
    "id": "<앞 단계에서 받은 ID>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## bongee_agent_result

출처: Bongee 추가

### 기능과 사용 시점

Read actual final response and session ID; unfinished is not completed.

### 연결·실행 조건

로컬 실행 기록/프로세스를 읽습니다. 조회 자체에는 AI API 키나 모델 호출이 필요하지 않습니다. provider_status는 CLI 설치·로그인 상태를 확인합니다.

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
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "bongee_agent_result",
  "arguments": {
    "id": "<앞 단계에서 받은 ID>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## bongee_agent_cancel

출처: Bongee 추가

### 기능과 사용 시점

Stop a session-agent process group.

### 연결·실행 조건

로컬 실행 기록/프로세스를 읽습니다. 조회 자체에는 AI API 키나 모델 호출이 필요하지 않습니다. provider_status는 CLI 설치·로그인 상태를 확인합니다.

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
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "bongee_agent_cancel",
  "arguments": {
    "id": "<앞 단계에서 받은 ID>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## bongee_agent_list

출처: Bongee 추가

### 기능과 사용 시점

List session executions.

### 연결·실행 조건

로컬 실행 기록/프로세스를 읽습니다. 조회 자체에는 AI API 키나 모델 호출이 필요하지 않습니다. provider_status는 CLI 설치·로그인 상태를 확인합니다.

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
  "name": "bongee_agent_list",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## bongee_monitor_status

출처: Bongee 추가

### 기능과 사용 시점

Read actual role-based agent states grouped into planning, design, development and verification. Includes original agent_execute observations and distinguishes unobserved registry state. No model calls.

### 연결·실행 조건

로컬 실행 기록/프로세스를 읽습니다. 조회 자체에는 AI API 키나 모델 호출이 필요하지 않습니다. provider_status는 CLI 설치·로그인 상태를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| cwd | string | 아니오 | Project absolute path. Default MCP working directory. | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "cwd": {
      "type": "string",
      "description": "Project absolute path. Default MCP working directory."
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "bongee_monitor_status",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.
