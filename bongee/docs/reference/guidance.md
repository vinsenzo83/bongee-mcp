# 기능 탐색·사용 안내

[전체 목차](../MANUAL.md) · [사용 순서](../WORKFLOWS.md)

- [guidance_brain](#guidance_brain)
- [guidance_capabilities](#guidance_capabilities)
- [guidance_recommend](#guidance_recommend)
- [guidance_discover](#guidance_discover)
- [guidance_workflow](#guidance_workflow)
- [guidance_quickref](#guidance_quickref)

## guidance_brain

출처: Ruflo 원본

### 기능과 사용 시점

Use when choosing how to execute a task with Ruflo. Queries the live capability brain, covers every registered MCP tool, separates registration from configuration/reachability/health/authorization, recommends capabilities, and returns the validated implementation loop.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| mode | string | 아니오 | Brain view. Default: overview. | {"enum":["overview","capabilities","coverage","ecosystem","recommend","implementation-loop"]} |
| task | string | 아니오 | Required for recommend mode. | — |
| domain | string | 아니오 | Optional capability domain filter for capabilities mode. | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "mode": {
      "type": "string",
      "enum": [
        "overview",
        "capabilities",
        "coverage",
        "ecosystem",
        "recommend",
        "implementation-loop"
      ],
      "description": "Brain view. Default: overview."
    },
    "task": {
      "type": "string",
      "description": "Required for recommend mode."
    },
    "domain": {
      "type": "string",
      "description": "Optional capability domain filter for capabilities mode."
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "guidance_brain",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## guidance_capabilities

출처: Ruflo 원본

### 기능과 사용 시점

List all capability areas with their tools, commands, agents, and skills. Use this to discover what Ruflo can do. Use when generic "what tool should I use?" guessing is wrong — Ruflo's guidance system uses the live tool index + your workflow context to recommend. Pair with hooks_route at task start. For trivial native-only tasks, no guidance call is needed.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| area | string | 아니오 | Filter to a specific area (e.g., "swarm-orchestration", "memory-knowledge"). Omit to list all areas. | — |
| format | string | 아니오 | Output format. "summary" lists names and descriptions, "detailed" includes tools/agents/skills. | {"enum":["summary","detailed"]} |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "area": {
      "type": "string",
      "description": "Filter to a specific area (e.g., \"swarm-orchestration\", \"memory-knowledge\"). Omit to list all areas."
    },
    "format": {
      "type": "string",
      "enum": [
        "summary",
        "detailed"
      ],
      "description": "Output format. \"summary\" lists names and descriptions, \"detailed\" includes tools/agents/skills."
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "guidance_capabilities",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## guidance_recommend

출처: Ruflo 원본

### 기능과 사용 시점

Given a task description, recommend which capability areas, tools, agents, and workflow to use. Use when generic "what tool should I use?" guessing is wrong — Ruflo's guidance system uses the live tool index + your workflow context to recommend. Pair with hooks_route at task start. For trivial native-only tasks, no guidance call is needed.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| task | string | 예 | Description of what you want to accomplish. | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "task": {
      "type": "string",
      "description": "Description of what you want to accomplish."
    }
  },
  "required": [
    "task"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "guidance_recommend",
  "arguments": {
    "task": "<task 입력>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## guidance_discover

출처: Ruflo 원본

### 기능과 사용 시점

Discover all available agents and skills from the .claude/ directory. Returns live filesystem data. Use when generic "what tool should I use?" guessing is wrong — Ruflo's guidance system uses the live tool index + your workflow context to recommend. Pair with hooks_route at task start. For trivial native-only tasks, no guidance call is needed.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| type | string | 아니오 | What to discover. Default: all. | {"enum":["agents","skills","plugins","packages","all"]} |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "type": {
      "type": "string",
      "enum": [
        "agents",
        "skills",
        "plugins",
        "packages",
        "all"
      ],
      "description": "What to discover. Default: all."
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "guidance_discover",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## guidance_workflow

출처: Ruflo 원본

### 기능과 사용 시점

Get a recommended workflow template for a task type. Includes steps, agents, and topology. Use when generic "what tool should I use?" guessing is wrong — Ruflo's guidance system uses the live tool index + your workflow context to recommend. Pair with hooks_route at task start. For trivial native-only tasks, no guidance call is needed.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| type | string | 예 | Workflow type. Options: bugfix, feature, refactor, testing, security, performance, memory, github-pr, release, swarm, learning, wasm, automation, setup | {"enum":["bugfix","feature","refactor","testing","security","performance","memory","github-pr","release","swarm","learning","wasm","automation","setup"]} |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "type": {
      "type": "string",
      "enum": [
        "bugfix",
        "feature",
        "refactor",
        "testing",
        "security",
        "performance",
        "memory",
        "github-pr",
        "release",
        "swarm",
        "learning",
        "wasm",
        "automation",
        "setup"
      ],
      "description": "Workflow type. Options: bugfix, feature, refactor, testing, security, performance, memory, github-pr, release, swarm, learning, wasm, automation, setup"
    }
  },
  "required": [
    "type"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "guidance_workflow",
  "arguments": {
    "type": "bugfix"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## guidance_quickref

출처: Ruflo 원본

### 기능과 사용 시점

Quick reference card for common operations. Returns the most useful commands for a given domain. Use when generic "what tool should I use?" guessing is wrong — Ruflo's guidance system uses the live tool index + your workflow context to recommend. Pair with hooks_route at task start. For trivial native-only tasks, no guidance call is needed.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| domain | string | 예 | Domain to get quick reference for. | {"enum":["getting-started","daily-dev","swarm-ops","memory-ops","github-ops","diagnostics"]} |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "domain": {
      "type": "string",
      "enum": [
        "getting-started",
        "daily-dev",
        "swarm-ops",
        "memory-ops",
        "github-ops",
        "diagnostics"
      ],
      "description": "Domain to get quick reference for."
    }
  },
  "required": [
    "domain"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "guidance_quickref",
  "arguments": {
    "domain": "getting-started"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.
