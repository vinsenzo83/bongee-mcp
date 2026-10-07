# GitHub 저장소·PR·이슈

[전체 목차](../MANUAL.md) · [사용 순서](../WORKFLOWS.md)

- [github_repo_analyze](#github_repo_analyze)
- [github_pr_manage](#github_pr_manage)
- [github_issue_track](#github_issue_track)
- [github_workflow](#github_workflow)
- [github_metrics](#github_metrics)

## github_repo_analyze

출처: Ruflo 원본

### 기능과 사용 시점

Analyze a GitHub repository Use when native Bash / file tools are wrong because this MCP tool exposes Ruflo-specific state or controllers that have no shell equivalent. For tasks that fit a one-line native command, prefer that.

### 연결·실행 조건

git/gh 설치와 대상 저장소 권한. 비공개 저장소·쓰기 작업에는 GitHub 로그인이 필요합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| owner | string | 아니오 | Repository owner | — |
| repo | string | 아니오 | Repository name | — |
| branch | string | 아니오 | Branch to analyze | — |
| deep | boolean | 아니오 | Deep analysis | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "owner": {
      "type": "string",
      "description": "Repository owner"
    },
    "repo": {
      "type": "string",
      "description": "Repository name"
    },
    "branch": {
      "type": "string",
      "description": "Branch to analyze"
    },
    "deep": {
      "type": "boolean",
      "description": "Deep analysis"
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "github_repo_analyze",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## github_pr_manage

출처: Ruflo 원본

### 기능과 사용 시점

Manage pull requests Use when native Bash / file tools are wrong because this MCP tool exposes Ruflo-specific state or controllers that have no shell equivalent. For tasks that fit a one-line native command, prefer that.

### 연결·실행 조건

git/gh 설치와 대상 저장소 권한. 비공개 저장소·쓰기 작업에는 GitHub 로그인이 필요합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| action | string | 아니오 | Action to perform | {"enum":["list","create","review","merge","close"]} |
| owner | string | 아니오 | Repository owner | — |
| repo | string | 아니오 | Repository name | — |
| prNumber | number | 아니오 | PR number | — |
| title | string | 아니오 | PR title | — |
| branch | string | 아니오 | Source branch | — |
| baseBranch | string | 아니오 | Target branch | — |
| body | string | 아니오 | PR description | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "action": {
      "type": "string",
      "enum": [
        "list",
        "create",
        "review",
        "merge",
        "close"
      ],
      "description": "Action to perform"
    },
    "owner": {
      "type": "string",
      "description": "Repository owner"
    },
    "repo": {
      "type": "string",
      "description": "Repository name"
    },
    "prNumber": {
      "type": "number",
      "description": "PR number"
    },
    "title": {
      "type": "string",
      "description": "PR title"
    },
    "branch": {
      "type": "string",
      "description": "Source branch"
    },
    "baseBranch": {
      "type": "string",
      "description": "Target branch"
    },
    "body": {
      "type": "string",
      "description": "PR description"
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "github_pr_manage",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## github_issue_track

출처: Ruflo 원본

### 기능과 사용 시점

Track and manage issues Use when native Bash / file tools are wrong because this MCP tool exposes Ruflo-specific state or controllers that have no shell equivalent. For tasks that fit a one-line native command, prefer that.

### 연결·실행 조건

git/gh 설치와 대상 저장소 권한. 비공개 저장소·쓰기 작업에는 GitHub 로그인이 필요합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| action | string | 아니오 | Action to perform | {"enum":["list","create","update","close","assign"]} |
| owner | string | 아니오 | Repository owner | — |
| repo | string | 아니오 | Repository name | — |
| issueNumber | number | 아니오 | Issue number | — |
| title | string | 아니오 | Issue title | — |
| body | string | 아니오 | Issue body | — |
| labels | array | 아니오 | Issue labels | — |
| assignees | array | 아니오 | Assignees | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "action": {
      "type": "string",
      "enum": [
        "list",
        "create",
        "update",
        "close",
        "assign"
      ],
      "description": "Action to perform"
    },
    "owner": {
      "type": "string",
      "description": "Repository owner"
    },
    "repo": {
      "type": "string",
      "description": "Repository name"
    },
    "issueNumber": {
      "type": "number",
      "description": "Issue number"
    },
    "title": {
      "type": "string",
      "description": "Issue title"
    },
    "body": {
      "type": "string",
      "description": "Issue body"
    },
    "labels": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Issue labels"
    },
    "assignees": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Assignees"
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "github_issue_track",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## github_workflow

출처: Ruflo 원본

### 기능과 사용 시점

Manage GitHub Actions workflows Use when native Bash / file tools are wrong because this MCP tool exposes Ruflo-specific state or controllers that have no shell equivalent. For tasks that fit a one-line native command, prefer that.

### 연결·실행 조건

git/gh 설치와 대상 저장소 권한. 비공개 저장소·쓰기 작업에는 GitHub 로그인이 필요합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| action | string | 아니오 | Action to perform | {"enum":["list","trigger","status","cancel"]} |
| owner | string | 아니오 | Repository owner | — |
| repo | string | 아니오 | Repository name | — |
| workflowId | string | 아니오 | Workflow ID or name | — |
| ref | string | 아니오 | Branch or tag ref | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "action": {
      "type": "string",
      "enum": [
        "list",
        "trigger",
        "status",
        "cancel"
      ],
      "description": "Action to perform"
    },
    "owner": {
      "type": "string",
      "description": "Repository owner"
    },
    "repo": {
      "type": "string",
      "description": "Repository name"
    },
    "workflowId": {
      "type": "string",
      "description": "Workflow ID or name"
    },
    "ref": {
      "type": "string",
      "description": "Branch or tag ref"
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "github_workflow",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## github_metrics

출처: Ruflo 원본

### 기능과 사용 시점

Get repository metrics and statistics Use when native Bash / file tools are wrong because this MCP tool exposes Ruflo-specific state or controllers that have no shell equivalent. For tasks that fit a one-line native command, prefer that.

### 연결·실행 조건

git/gh 설치와 대상 저장소 권한. 비공개 저장소·쓰기 작업에는 GitHub 로그인이 필요합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| owner | string | 아니오 | Repository owner | — |
| repo | string | 아니오 | Repository name | — |
| metric | string | 아니오 | Metric type | {"enum":["all","commits","contributors","traffic","releases"]} |
| timeRange | string | 아니오 | Time range (e.g., "7d", "30d", "90d") | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "owner": {
      "type": "string",
      "description": "Repository owner"
    },
    "repo": {
      "type": "string",
      "description": "Repository name"
    },
    "metric": {
      "type": "string",
      "enum": [
        "all",
        "commits",
        "contributors",
        "traffic",
        "releases"
      ],
      "description": "Metric type"
    },
    "timeRange": {
      "type": "string",
      "description": "Time range (e.g., \"7d\", \"30d\", \"90d\")"
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "github_metrics",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.
