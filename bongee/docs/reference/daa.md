# 동적 자율 에이전트

[전체 목차](../MANUAL.md) · [사용 순서](../WORKFLOWS.md)

- [daa_agent_create](#daa_agent_create)
- [daa_agent_adapt](#daa_agent_adapt)
- [daa_workflow_create](#daa_workflow_create)
- [daa_workflow_execute](#daa_workflow_execute)
- [daa_knowledge_share](#daa_knowledge_share)
- [daa_learning_status](#daa_learning_status)
- [daa_cognitive_pattern](#daa_cognitive_pattern)
- [daa_performance_metrics](#daa_performance_metrics)

## daa_agent_create

출처: Ruflo 원본

### 기능과 사용 시점

Create a decentralized autonomous agent Use when native Task is wrong because you need agents that adapt their cognitive pattern (convergent / divergent / lateral / systems / critical) per-task and share knowledge across the swarm. For static one-shot agents, native Task is fine.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| id | string | 예 | Agent ID | — |
| name | string | 아니오 | Agent name | — |
| type | string | 아니오 | Agent type | — |
| cognitivePattern | string | 아니오 | Cognitive pattern | {"enum":["convergent","divergent","lateral","systems","critical","adaptive"]} |
| learningRate | number | 아니오 | Learning rate (0-1) | — |
| enableMemory | boolean | 아니오 | Enable persistent memory | — |
| capabilities | array | 아니오 | Agent capabilities | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "description": "Agent ID"
    },
    "name": {
      "type": "string",
      "description": "Agent name"
    },
    "type": {
      "type": "string",
      "description": "Agent type"
    },
    "cognitivePattern": {
      "type": "string",
      "enum": [
        "convergent",
        "divergent",
        "lateral",
        "systems",
        "critical",
        "adaptive"
      ],
      "description": "Cognitive pattern"
    },
    "learningRate": {
      "type": "number",
      "description": "Learning rate (0-1)"
    },
    "enableMemory": {
      "type": "boolean",
      "description": "Enable persistent memory"
    },
    "capabilities": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Agent capabilities"
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
  "name": "daa_agent_create",
  "arguments": {
    "id": "<앞 단계에서 받은 ID>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## daa_agent_adapt

출처: Ruflo 원본

### 기능과 사용 시점

Trigger agent adaptation based on feedback Use when native Task is wrong because you need agents that adapt their cognitive pattern (convergent / divergent / lateral / systems / critical) per-task and share knowledge across the swarm. For static one-shot agents, native Task is fine.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| agentId | string | 예 | Agent ID | — |
| feedback | string | 아니오 | Feedback message | — |
| performanceScore | number | 아니오 | Performance score (0-1) | — |
| suggestions | array | 아니오 | Improvement suggestions | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "agentId": {
      "type": "string",
      "description": "Agent ID"
    },
    "feedback": {
      "type": "string",
      "description": "Feedback message"
    },
    "performanceScore": {
      "type": "number",
      "description": "Performance score (0-1)"
    },
    "suggestions": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Improvement suggestions"
    }
  },
  "required": [
    "agentId"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "daa_agent_adapt",
  "arguments": {
    "agentId": "<앞 단계에서 받은 ID>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## daa_workflow_create

출처: Ruflo 원본

### 기능과 사용 시점

Create an autonomous workflow Use when native Task is wrong because you need agents that adapt their cognitive pattern (convergent / divergent / lateral / systems / critical) per-task and share knowledge across the swarm. For static one-shot agents, native Task is fine.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| id | string | 예 | Workflow ID | — |
| name | string | 예 | Workflow name | — |
| steps | array | 아니오 | Workflow steps | — |
| strategy | string | 아니오 | Execution strategy | {"enum":["parallel","sequential","adaptive"]} |
| dependencies | object | 아니오 | Step dependencies | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "description": "Workflow ID"
    },
    "name": {
      "type": "string",
      "description": "Workflow name"
    },
    "steps": {
      "type": "array",
      "items": {
        "type": "object"
      },
      "description": "Workflow steps"
    },
    "strategy": {
      "type": "string",
      "enum": [
        "parallel",
        "sequential",
        "adaptive"
      ],
      "description": "Execution strategy"
    },
    "dependencies": {
      "type": "object",
      "description": "Step dependencies"
    }
  },
  "required": [
    "id",
    "name"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "daa_workflow_create",
  "arguments": {
    "id": "<앞 단계에서 받은 ID>",
    "name": "<name 입력>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## daa_workflow_execute

출처: Ruflo 원본

### 기능과 사용 시점

Execute a DAA workflow Use when native Task is wrong because you need agents that adapt their cognitive pattern (convergent / divergent / lateral / systems / critical) per-task and share knowledge across the swarm. For static one-shot agents, native Task is fine.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| workflowId | string | 예 | Workflow ID | — |
| agentIds | array | 아니오 | Agent IDs to use | — |
| parallelExecution | boolean | 아니오 | Enable parallel execution | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "workflowId": {
      "type": "string",
      "description": "Workflow ID"
    },
    "agentIds": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Agent IDs to use"
    },
    "parallelExecution": {
      "type": "boolean",
      "description": "Enable parallel execution"
    }
  },
  "required": [
    "workflowId"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "daa_workflow_execute",
  "arguments": {
    "workflowId": "<앞 단계에서 받은 ID>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## daa_knowledge_share

출처: Ruflo 원본

### 기능과 사용 시점

Share knowledge between agents Use when native Task is wrong because you need agents that adapt their cognitive pattern (convergent / divergent / lateral / systems / critical) per-task and share knowledge across the swarm. For static one-shot agents, native Task is fine.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| sourceAgentId | string | 예 | Source agent ID | — |
| targetAgentIds | array | 예 | Target agent IDs | — |
| knowledgeDomain | string | 아니오 | Knowledge domain | — |
| knowledgeContent | object | 아니오 | Knowledge to share | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "sourceAgentId": {
      "type": "string",
      "description": "Source agent ID"
    },
    "targetAgentIds": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Target agent IDs"
    },
    "knowledgeDomain": {
      "type": "string",
      "description": "Knowledge domain"
    },
    "knowledgeContent": {
      "type": "object",
      "description": "Knowledge to share"
    }
  },
  "required": [
    "sourceAgentId",
    "targetAgentIds"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "daa_knowledge_share",
  "arguments": {
    "sourceAgentId": "<앞 단계에서 받은 ID>",
    "targetAgentIds": [
      "<targetAgentIds 입력>"
    ]
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## daa_learning_status

출처: Ruflo 원본

### 기능과 사용 시점

Get learning status for DAA agents Use when native Task is wrong because you need agents that adapt their cognitive pattern (convergent / divergent / lateral / systems / critical) per-task and share knowledge across the swarm. For static one-shot agents, native Task is fine.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| agentId | string | 아니오 | Specific agent ID | — |
| detailed | boolean | 아니오 | Include detailed metrics | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "agentId": {
      "type": "string",
      "description": "Specific agent ID"
    },
    "detailed": {
      "type": "boolean",
      "description": "Include detailed metrics"
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "daa_learning_status",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## daa_cognitive_pattern

출처: Ruflo 원본

### 기능과 사용 시점

Analyze or change cognitive patterns Use when native Task is wrong because you need agents that adapt their cognitive pattern (convergent / divergent / lateral / systems / critical) per-task and share knowledge across the swarm. For static one-shot agents, native Task is fine.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| agentId | string | 아니오 | Agent ID | — |
| action | string | 아니오 | Action | {"enum":["analyze","change"]} |
| pattern | string | 아니오 | New pattern | {"enum":["convergent","divergent","lateral","systems","critical","adaptive"]} |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "agentId": {
      "type": "string",
      "description": "Agent ID"
    },
    "action": {
      "type": "string",
      "enum": [
        "analyze",
        "change"
      ],
      "description": "Action"
    },
    "pattern": {
      "type": "string",
      "enum": [
        "convergent",
        "divergent",
        "lateral",
        "systems",
        "critical",
        "adaptive"
      ],
      "description": "New pattern"
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "daa_cognitive_pattern",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## daa_performance_metrics

출처: Ruflo 원본

### 기능과 사용 시점

Get DAA performance metrics Use when native Task is wrong because you need agents that adapt their cognitive pattern (convergent / divergent / lateral / systems / critical) per-task and share knowledge across the swarm. For static one-shot agents, native Task is fine.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| category | string | 아니오 | Metrics category | {"enum":["all","agents","workflows","learning"]} |
| timeRange | string | 아니오 | Time range | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "category": {
      "type": "string",
      "enum": [
        "all",
        "agents",
        "workflows",
        "learning"
      ],
      "description": "Metrics category"
    },
    "timeRange": {
      "type": "string",
      "description": "Time range"
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "daa_performance_metrics",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.
