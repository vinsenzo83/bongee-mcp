# 평가·보안·개선 루프

[전체 목차](../MANUAL.md) · [사용 순서](../WORKFLOWS.md)

- [metaharness_score](#metaharness_score)
- [metaharness_genome](#metaharness_genome)
- [metaharness_mcp_scan](#metaharness_mcp_scan)
- [metaharness_threat_model](#metaharness_threat_model)
- [metaharness_oia_audit](#metaharness_oia_audit)
- [metaharness_audit_list](#metaharness_audit_list)
- [metaharness_similarity](#metaharness_similarity)
- [metaharness_drift_from_history](#metaharness_drift_from_history)
- [metaharness_audit_trend](#metaharness_audit_trend)
- [metaharness_evolve](#metaharness_evolve)
- [metaharness_security_bench](#metaharness_security_bench)
- [metaharness_bench](#metaharness_bench)
- [metaharness_redblue](#metaharness_redblue)
- [metaharness_learn](#metaharness_learn)
- [metaharness_gepa](#metaharness_gepa)
- [metaharness_flywheel](#metaharness_flywheel)

## metaharness_score

출처: Ruflo 원본

### 기능과 사용 시점

ADR-150 — 5-dimension harness readiness scorecard from `metaharness score <path>` (harnessFit / compileConfidence / taskCoverage / toolSafety / memoryUsefulness + estCostPerRunUsd). Pure-read subprocess; graceful degradation when metaharness optional dep absent. Use when you need an evidence-based readiness signal before recommending the user run `ruflo metaharness mint`; reading the repo manually is wrong because the 5-dim score includes signals (cost-per-run, MCP surface safety) that aren't obvious from source. [Return shape: {success, data, degraded, exitCode}. success===true iff exitCode===0 (includes graceful-degradation path where dep is absent — check degraded for that). success===false with exitCode===1 = intentional alert exit (read data.alert.triggered). success===false with exitCode===2 = input error (data is null).]

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| path | string | 아니오 | Repo path to score (default: cwd) | {"default":"."} |
| alertOnFitBelow | number | 아니오 | Set to make the tool flag harnessFit < N (informational only; tool result has alert.triggered field) | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "path": {
      "type": "string",
      "description": "Repo path to score (default: cwd)",
      "default": "."
    },
    "alertOnFitBelow": {
      "type": "number",
      "description": "Set to make the tool flag harnessFit < N (informational only; tool result has alert.triggered field)"
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "metaharness_score",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## metaharness_genome

출처: Ruflo 원본

### 기능과 사용 시점

ADR-150 — 7-section categorical readiness report from `metaharness genome <path>` (repo_type / agent_topology / risk_score / mcp_surface / test_confidence / publish_readiness). Upstream needs-work/blocked exit statuses are valid verdicts and return successfully as data.verdict + data.verdictExitCode; only a missing or malformed report is an error. Use when you need the categorical view (vs numeric score). Pair with metaharness_score for the full readiness picture — score-alone is wrong because two harnesses with the same harnessFit can have very different agent_topology and mcp_surface. [Return shape: {success, data, degraded, exitCode}. success===true iff exitCode===0 (includes graceful-degradation path where dep is absent — check degraded for that). success===false with exitCode===1 = intentional alert exit (read data.alert.triggered). success===false with exitCode===2 = input error (data is null).]

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| path | string | 아니오 | Repo path to analyze (default: cwd) | {"default":"."} |
| alertOnRiskAbove | number | 아니오 | Set to flag risk_score > N | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "path": {
      "type": "string",
      "description": "Repo path to analyze (default: cwd)",
      "default": "."
    },
    "alertOnRiskAbove": {
      "type": "number",
      "description": "Set to flag risk_score > N"
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "metaharness_genome",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## metaharness_mcp_scan

출처: Ruflo 원본

### 기능과 사용 시점

ADR-150 — static security scan of `.mcp/servers.json` + `.harness/claims.json` via `harness mcp-scan <path>`. Reads only; no dispatch. Use when you are about to expose a new MCP server config to humans/agents. Eyeballing the JSON is wrong because the scan catches policy regressions (capability grants, audit gaps) that humans miss. [Return shape: {success, data, degraded, exitCode}. success===true iff exitCode===0 (includes graceful-degradation path where dep is absent — check degraded for that). success===false with exitCode===1 = intentional alert exit (read data.alert.triggered). success===false with exitCode===2 = input error (data is null).]

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| path | string | 아니오 | Repo path with .mcp/servers.json (default: cwd) | {"default":"."} |
| failOn | string | 아니오 | Severity floor for tool.alert.triggered (default: high) | {"enum":["low","medium","high"],"default":"high"} |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "path": {
      "type": "string",
      "description": "Repo path with .mcp/servers.json (default: cwd)",
      "default": "."
    },
    "failOn": {
      "type": "string",
      "enum": [
        "low",
        "medium",
        "high"
      ],
      "description": "Severity floor for tool.alert.triggered (default: high)",
      "default": "high"
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "metaharness_mcp_scan",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## metaharness_threat_model

출처: Ruflo 원본

### 기능과 사용 시점

ADR-150 — enterprise-grade threat model from `harness threat-model <path>`. Returns worst-severity verdict (clean/low/medium/high) + categorized findings suitable for sharing with infosec. Use when you need a sharable infosec-grade verdict; a one-line summary is wrong because compliance reviewers want the per-category breakdown. [Return shape: {success, data, degraded, exitCode}. success===true iff exitCode===0 (includes graceful-degradation path where dep is absent — check degraded for that). success===false with exitCode===1 = intentional alert exit (read data.alert.triggered). success===false with exitCode===2 = input error (data is null).]

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| path | string | 아니오 | Repo path (default: cwd) | {"default":"."} |
| failOn | string | 아니오 | Severity floor for tool.alert.triggered (default: high) | {"enum":["clean","low","medium","high"],"default":"high"} |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "path": {
      "type": "string",
      "description": "Repo path (default: cwd)",
      "default": "."
    },
    "failOn": {
      "type": "string",
      "enum": [
        "clean",
        "low",
        "medium",
        "high"
      ],
      "description": "Severity floor for tool.alert.triggered (default: high)",
      "default": "high"
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "metaharness_threat_model",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## metaharness_oia_audit

출처: Ruflo 원본

### 기능과 사용 시점

ADR-150 — composite weekly audit. Bundles oia-manifest + threat-model + mcp-scan into one timestamped record persisted to `metaharness-audit` memory namespace (or --dry-run to skip persistence). Use when you want to seed periodic drift detection (pair with metaharness_drift_from_history). Running the 3 sub-audits separately is wrong because you lose the composite worst-severity rollup and the timestamped record that drift detection needs to compare against. [Return shape: {success, data, degraded, exitCode}. success===true iff exitCode===0 (includes graceful-degradation path where dep is absent — check degraded for that). success===false with exitCode===1 = intentional alert exit (read data.alert.triggered). success===false with exitCode===2 = input error (data is null).]

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| path | string | 아니오 | Repo path (default: cwd) | {"default":"."} |
| dryRun | boolean | 아니오 | Skip memory persistence — local-only run | {"default":false} |
| alertOnWorst | string | 아니오 | Composite worst-severity floor for tool.alert.triggered | {"enum":["clean","low","medium","high"]} |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "path": {
      "type": "string",
      "description": "Repo path (default: cwd)",
      "default": "."
    },
    "dryRun": {
      "type": "boolean",
      "description": "Skip memory persistence — local-only run",
      "default": false
    },
    "alertOnWorst": {
      "type": "string",
      "enum": [
        "clean",
        "low",
        "medium",
        "high"
      ],
      "description": "Composite worst-severity floor for tool.alert.triggered"
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "metaharness_oia_audit",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## metaharness_audit_list

출처: Ruflo 원본

### 기능과 사용 시점

ADR-150 iter 16 — list timestamped records from the `metaharness-audit` memory namespace. Use when you need to discover which audit keys exist before running metaharness_audit_trend. Guessing key names is wrong because timestamps include sub-second precision; pair with metaharness_audit_trend by passing the returned key. [Return shape: {success, data, degraded, exitCode}. success===true iff exitCode===0 (includes graceful-degradation path where dep is absent — check degraded for that). success===false with exitCode===1 = intentional alert exit (read data.alert.triggered). success===false with exitCode===2 = input error (data is null).]

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| limit | number | 아니오 | Max records to return, newest first (default: 20) | {"default":20} |
| since | string | 아니오 | Filter to last N(h\|d\|w\|m), e.g. "30d" for last 30 days | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "limit": {
      "type": "number",
      "description": "Max records to return, newest first (default: 20)",
      "default": 20
    },
    "since": {
      "type": "string",
      "description": "Filter to last N(h|d|w|m), e.g. \"30d\" for last 30 days"
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "metaharness_audit_list",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## metaharness_similarity

출처: Ruflo 원본

### 기능과 사용 시점

ADR-152 §3.1 — weighted similarity between two harness fingerprints (genome + score JSON). Returns overall ∈ [0,1] plus per-component breakdown (cosine over 9 numerics, categorical over 4 enums, jaccard over agent_topology). Pure-TS, zero `@metaharness/*` dep. Use when you need to (a) rank candidate templates against a target repo, (b) decide fork-vs-scaffold, or (c) feed ADR-151 §3.2 Recommender / §3.3 Drift / §3.5 Plugin Compat. Hand-comparing genome fields is wrong because the weighted blend (cosine + categorical + jaccard) reproduces human judgment on the spike-similarity invariants. [Return shape: {success, data, degraded, exitCode}. success===true iff exitCode===0 (includes graceful-degradation path where dep is absent — check degraded for that). success===false with exitCode===1 = intentional alert exit (read data.alert.triggered). success===false with exitCode===2 = input error (data is null).]

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| aFile | string | 아니오 | Path to harness A genome+score JSON file (mutually exclusive with aKey) | — |
| bFile | string | 아니오 | Path to harness B genome+score JSON file (mutually exclusive with bKey) | — |
| aKey | string | 아니오 | Memory key for harness A in `metaharness-audit` namespace (mutually exclusive with aFile) | — |
| bKey | string | 아니오 | Memory key for harness B in `metaharness-audit` namespace (mutually exclusive with bFile) | — |
| perDimension | boolean | 아니오 | Include per-dimension contribution breakdown (used by ADR-151 §3.2 Recommender) | {"default":false} |
| alertBelow | number | 아니오 | Set tool.alert.triggered when overall < N (used by ADR-151 §3.3 Drift Detection) | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "aFile": {
      "type": "string",
      "description": "Path to harness A genome+score JSON file (mutually exclusive with aKey)"
    },
    "bFile": {
      "type": "string",
      "description": "Path to harness B genome+score JSON file (mutually exclusive with bKey)"
    },
    "aKey": {
      "type": "string",
      "description": "Memory key for harness A in `metaharness-audit` namespace (mutually exclusive with aFile)"
    },
    "bKey": {
      "type": "string",
      "description": "Memory key for harness B in `metaharness-audit` namespace (mutually exclusive with bFile)"
    },
    "perDimension": {
      "type": "boolean",
      "description": "Include per-dimension contribution breakdown (used by ADR-151 §3.2 Recommender)",
      "default": false
    },
    "alertBelow": {
      "type": "number",
      "description": "Set tool.alert.triggered when overall < N (used by ADR-151 §3.3 Drift Detection)"
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "metaharness_similarity",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## metaharness_drift_from_history

출처: Ruflo 원본

### 기능과 사용 시점

iter 53 — one-command drift detection. Composes audit-list + oia-audit + audit-trend: finds the most recent record in `metaharness-audit` namespace (or skips that with `baselineKey`/`baselineFile`), runs a fresh audit against the current path, diffs via ADR-152 §3.1 similarity, alerts when structural similarity falls below `threshold`. Use when you need a structured drift report before recommending the user act on regressions; calling the 3 sub-tools separately is wrong because you lose the composed alert ladder + fastpath optimization (iter 66/67: `baselineKey` ~14x faster, `baselineFile` ~19x faster, ideal for CI artifact pipelines). [Return shape: {success, data, degraded, exitCode}. success===true iff exitCode===0 (includes graceful-degradation path where dep is absent — check degraded for that). success===false with exitCode===1 = intentional alert exit (read data.alert.triggered). success===false with exitCode===2 = input error (data is null).]

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| path | string | 아니오 | Repo path to audit (default: cwd) | {"default":"."} |
| baselineSince | string | 아니오 | Use a baseline at least N(h\|d\|w) old, e.g. "7d" — skips drift against ultra-recent audits | — |
| baselineKey | string | 아니오 | iter 66 — explicit memory key for the baseline audit. Skips audit-list (no ONNX warmup). Get from `metaharness_audit_list` first. | — |
| baselineFile | string | 아니오 | iter 67 — file path to a saved oia-audit JSON. Skips audit-list AND memory roundtrip. Ideal for CI artifact pipelines (e.g., comparing this run vs a downloaded prior-run artifact). | — |
| threshold | number | 아니오 | Alert when structural similarity < N. Default 0.95. | {"default":0.95} |
| alertOnNewSeverity | string | 아니오 | iter 78 — ALSO alert when any introduced finding meets or exceeds this severity. Orthogonal to `threshold`: a CRITICAL finding triggers even if structural similarity > threshold. | {"enum":["info","low","medium","warn","high","error","critical"]} |
| dryRun | boolean | 아니오 | Skip persisting the fresh audit to memory | {"default":false} |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "path": {
      "type": "string",
      "description": "Repo path to audit (default: cwd)",
      "default": "."
    },
    "baselineSince": {
      "type": "string",
      "description": "Use a baseline at least N(h|d|w) old, e.g. \"7d\" — skips drift against ultra-recent audits"
    },
    "baselineKey": {
      "type": "string",
      "description": "iter 66 — explicit memory key for the baseline audit. Skips audit-list (no ONNX warmup). Get from `metaharness_audit_list` first."
    },
    "baselineFile": {
      "type": "string",
      "description": "iter 67 — file path to a saved oia-audit JSON. Skips audit-list AND memory roundtrip. Ideal for CI artifact pipelines (e.g., comparing this run vs a downloaded prior-run artifact)."
    },
    "threshold": {
      "type": "number",
      "description": "Alert when structural similarity < N. Default 0.95.",
      "default": 0.95
    },
    "alertOnNewSeverity": {
      "type": "string",
      "enum": [
        "info",
        "low",
        "medium",
        "warn",
        "high",
        "error",
        "critical"
      ],
      "description": "iter 78 — ALSO alert when any introduced finding meets or exceeds this severity. Orthogonal to `threshold`: a CRITICAL finding triggers even if structural similarity > threshold."
    },
    "dryRun": {
      "type": "boolean",
      "description": "Skip persisting the fresh audit to memory",
      "default": false
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "metaharness_drift_from_history",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## metaharness_audit_trend

출처: Ruflo 원본

### 기능과 사용 시점

ADR-150 iter 15 — diff two oia-audit records (drift detection). Accepts EITHER memory keys (run metaharness_audit_list first to discover them) OR direct file paths (useful for diffing CI artifacts). Surfaces composite worst-severity delta + per-component status change + introduced/cleared findings + (iter 38) ADR-152 §3.1 structural distance when both records carry a fingerprint. Use when you have two specific audits to compare; pair with metaharness_audit_list for key discovery. Skipping this tool and eyeballing two JSONs is wrong because the structural-distance verdict (near-identical / minor-drift / moderate-drift / major-drift) is the operationally-useful summary. [Return shape: {success, data, degraded, exitCode}. success===true iff exitCode===0 (includes graceful-degradation path where dep is absent — check degraded for that). success===false with exitCode===1 = intentional alert exit (read data.alert.triggered). success===false with exitCode===2 = input error (data is null).]

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| baselineKey | string | 아니오 | Memory key for the older audit (mutually exclusive with baselineFile) | — |
| currentKey | string | 아니오 | Memory key for the newer audit (mutually exclusive with currentFile) | — |
| baselineFile | string | 아니오 | iter 46 — file path to older audit JSON (mutually exclusive with baselineKey) | — |
| currentFile | string | 아니오 | iter 46 — file path to newer audit JSON (mutually exclusive with currentKey) | — |
| alertOnWorsening | boolean | 아니오 | Set tool.alert.triggered when composite worst severity worsened | {"default":false} |
| alertOnDistanceBelow | number | 아니오 | iter 38 — set tool.alert.triggered when structural similarity falls below N (uses fingerprint field added in iter 38; older records emit verdict=unavailable) | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "baselineKey": {
      "type": "string",
      "description": "Memory key for the older audit (mutually exclusive with baselineFile)"
    },
    "currentKey": {
      "type": "string",
      "description": "Memory key for the newer audit (mutually exclusive with currentFile)"
    },
    "baselineFile": {
      "type": "string",
      "description": "iter 46 — file path to older audit JSON (mutually exclusive with baselineKey)"
    },
    "currentFile": {
      "type": "string",
      "description": "iter 46 — file path to newer audit JSON (mutually exclusive with currentKey)"
    },
    "alertOnWorsening": {
      "type": "boolean",
      "description": "Set tool.alert.triggered when composite worst severity worsened",
      "default": false
    },
    "alertOnDistanceBelow": {
      "type": "number",
      "description": "iter 38 — set tool.alert.triggered when structural similarity falls below N (uses fingerprint field added in iter 38; older records emit verdict=unavailable)"
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "metaharness_audit_trend",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## metaharness_evolve

출처: Ruflo 원본

### 기능과 사용 시점

ADR-153 — Darwin Mode: mutate one of seven harness policy surfaces (planner/contextBuilder/reviewer/retryPolicy/toolPolicy/memoryPolicy/scorePolicy), sandbox-score each variant, promote only measured wins. The WRITE layer that closes the loop ADR-150 opens (score+genome describe; evolve changes). Use when readiness scores are flat and you want to discover WHICH surface mutation moves them, without retraining the foundation model. Bypassing this tool and hand-tuning is wrong because (a) single-degree-of-freedom mutations keep causal attribution clean, (b) the upstream safety layer catches secret/shell-out/network/dynamic-eval patterns before any variant runs (exit 99 = safety-disqualified, propagated verbatim). REQUIRES --confirm; defaults to dry-run plan output. Long-running: timeout scales with generations×children×sandbox-cost. [Return shape: {success, data, degraded, exitCode}. success===true iff exitCode===0 (includes graceful-degradation path where dep is absent — check degraded for that). success===false with exitCode===1 = intentional alert exit (read data.alert.triggered). success===false with exitCode===2 = input error (data is null).]

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| repo | string | 아니오 | Repo path to evolve (default: cwd) | {"default":"."} |
| generations | number | 아니오 | 1..50 (ruflo cap) | {"default":3} |
| children | number | 아니오 | 1..20 (ruflo cap) — variants per generation | {"default":3} |
| concurrency | number | 아니오 | 1..8 (ruflo cap) | {"default":2} |
| seed | number | 아니오 | PRNG seed for reproducibility | — |
| sandbox | string | 아니오 | real = run npm test; mock = scoring stub; agent = LLM judge | {"enum":["real","mock","agent"],"default":"real"} |
| selection | string | 아니오 | Next-generation sampling strategy from the archive tree | {"enum":["quality-diversity","behavioral-diversity","niche-steering","clade","pareto"]} |
| crossover | boolean | 아니오 | Enable crossover (2-parent) mutations alongside the default 1-parent path | {"default":false} |
| epistasis | boolean | 아니오 | Detect epistatic surface interactions before mutating | {"default":false} |
| curriculum | boolean | 아니오 | Schedule increasing-difficulty bench tasks across generations | {"default":false} |
| riskBudget | number | 아니오 | Max number of safety-near-miss variants allowed before halting | — |
| fdr | number | 아니오 | Benjamini-Hochberg FDR threshold for accepting variant fitness as significant | — |
| tie | string | 아니오 | Tiebreaker when champions are within noise — "faster" prefers lower sandbox cost | {"enum":["faster"]} |
| bench | string | 아니오 | Path to a bench suite JSON (use metaharness_bench --op create to scaffold) | — |
| mutator | string | 아니오 | deterministic = template-based; ruvllm = local LLM-driven | {"enum":["deterministic","ruvllm"],"default":"deterministic"} |
| ruvllmUrl | string | 아니오 | RuVLLM endpoint URL (only used when mutator=ruvllm) | — |
| ruvllmModel | string | 아니오 | RuVLLM model id (only used when mutator=ruvllm) | — |
| confirm | boolean | 아니오 | REQUIRED to actually evolve; without it, returns a dry-run plan | {"default":false} |
| alertOnNoImprovement | boolean | 아니오 | Exit 1 when champion ≤ parent | {"default":false} |
| timeoutMs | number | 아니오 | Override the computed timeout (default = generations×children×per-variant) | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "repo": {
      "type": "string",
      "description": "Repo path to evolve (default: cwd)",
      "default": "."
    },
    "generations": {
      "type": "number",
      "description": "1..50 (ruflo cap)",
      "default": 3
    },
    "children": {
      "type": "number",
      "description": "1..20 (ruflo cap) — variants per generation",
      "default": 3
    },
    "concurrency": {
      "type": "number",
      "description": "1..8 (ruflo cap)",
      "default": 2
    },
    "seed": {
      "type": "number",
      "description": "PRNG seed for reproducibility"
    },
    "sandbox": {
      "type": "string",
      "enum": [
        "real",
        "mock",
        "agent"
      ],
      "description": "real = run npm test; mock = scoring stub; agent = LLM judge",
      "default": "real"
    },
    "selection": {
      "type": "string",
      "enum": [
        "quality-diversity",
        "behavioral-diversity",
        "niche-steering",
        "clade",
        "pareto"
      ],
      "description": "Next-generation sampling strategy from the archive tree"
    },
    "crossover": {
      "type": "boolean",
      "description": "Enable crossover (2-parent) mutations alongside the default 1-parent path",
      "default": false
    },
    "epistasis": {
      "type": "boolean",
      "description": "Detect epistatic surface interactions before mutating",
      "default": false
    },
    "curriculum": {
      "type": "boolean",
      "description": "Schedule increasing-difficulty bench tasks across generations",
      "default": false
    },
    "riskBudget": {
      "type": "number",
      "description": "Max number of safety-near-miss variants allowed before halting"
    },
    "fdr": {
      "type": "number",
      "description": "Benjamini-Hochberg FDR threshold for accepting variant fitness as significant"
    },
    "tie": {
      "type": "string",
      "enum": [
        "faster"
      ],
      "description": "Tiebreaker when champions are within noise — \"faster\" prefers lower sandbox cost"
    },
    "bench": {
      "type": "string",
      "description": "Path to a bench suite JSON (use metaharness_bench --op create to scaffold)"
    },
    "mutator": {
      "type": "string",
      "enum": [
        "deterministic",
        "ruvllm"
      ],
      "description": "deterministic = template-based; ruvllm = local LLM-driven",
      "default": "deterministic"
    },
    "ruvllmUrl": {
      "type": "string",
      "description": "RuVLLM endpoint URL (only used when mutator=ruvllm)"
    },
    "ruvllmModel": {
      "type": "string",
      "description": "RuVLLM model id (only used when mutator=ruvllm)"
    },
    "confirm": {
      "type": "boolean",
      "description": "REQUIRED to actually evolve; without it, returns a dry-run plan",
      "default": false
    },
    "alertOnNoImprovement": {
      "type": "boolean",
      "description": "Exit 1 when champion ≤ parent",
      "default": false
    },
    "timeoutMs": {
      "type": "number",
      "description": "Override the computed timeout (default = generations×children×per-variant)"
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "metaharness_evolve",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## metaharness_security_bench

출처: Ruflo 원본

### 기능과 사용 시점

ADR-153 — upstream Darwin Shield (their own ADR-155): evolves a champion security-detection harness against a 10-vuln/9-decoy ground-truth corpus and grades on TPR/FPR/patch-pass/repro/unsafe vs four baselines (B0 static, B1 LLM-single-pass, B2 fixed-agent, B3 Darwin-champion). Closest reference implementation for ruflo ADR-155 nightly self-learning security harness (#2417). Use when you need an empirical floor for Loop A reward-signal soundness; running this periodically gives baseline diversity and week-over-week champion-fitness drift. Bypassing this and just running the static MCP scan is wrong because static-only baseline (B0) reaches TPR=0.3/FPR=1 — proving static-alone has a measured detection ceiling. Parses overall PASS/FAIL + per-gate verdicts + baselines table from markdown. [Return shape: {success, data, degraded, exitCode}. success===true iff exitCode===0 (includes graceful-degradation path where dep is absent — check degraded for that). success===false with exitCode===1 = intentional alert exit (read data.alert.triggered). success===false with exitCode===2 = input error (data is null).]

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| population | number | 아니오 | 1..20 (ruflo cap) — candidate detectors per cycle | {"default":2} |
| cycles | number | 아니오 | 1..100 (ruflo cap) — evolution cycles | {"default":1} |
| seed | number | 아니오 | PRNG seed for reproducibility | — |
| alertOnFail | boolean | 아니오 | Exit 1 when overall verdict is FAIL | {"default":false} |
| timeoutMs | number | 아니오 | Override the computed timeout (default = 3s × 19 evals × population × cycles + 30s) | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "population": {
      "type": "number",
      "description": "1..20 (ruflo cap) — candidate detectors per cycle",
      "default": 2
    },
    "cycles": {
      "type": "number",
      "description": "1..100 (ruflo cap) — evolution cycles",
      "default": 1
    },
    "seed": {
      "type": "number",
      "description": "PRNG seed for reproducibility"
    },
    "alertOnFail": {
      "type": "boolean",
      "description": "Exit 1 when overall verdict is FAIL",
      "default": false
    },
    "timeoutMs": {
      "type": "number",
      "description": "Override the computed timeout (default = 3s × 19 evals × population × cycles + 30s)"
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "metaharness_security_bench",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## metaharness_bench

출처: Ruflo 원본

### 기능과 사용 시점

ADR-153 supporting verb — create or verify bench suites used by metaharness_evolve --bench. Bench suites are JSON files of {input, expectedOutput, weight} tasks; scoring against a fixed corpus decouples evolution from flaky/slow/undersized `npm test`. Use when iterating on the same harness across commits and `npm test` is too noisy/slow to drive evolution — use --op create to scaffold from a repo, --op verify (cheap, ~5s) to gate suite changes in CI. Native test runners are wrong here because per-run noise drowns out champion-fitness deltas; bench gives you a stable baseline. [Return shape: {success, data, degraded, exitCode}. success===true iff exitCode===0 (includes graceful-degradation path where dep is absent — check degraded for that). success===false with exitCode===1 = intentional alert exit (read data.alert.triggered). success===false with exitCode===2 = input error (data is null).]

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| op | string | 예 | create scaffolds suite.json from a repo; verify validates an existing suite | {"enum":["create","verify"]} |
| repo | string | 아니오 | Repo path (required for --op create) | — |
| suite | string | 아니오 | Suite JSON path (required for --op verify) | — |
| out | string | 아니오 | Override default output path for --op create (default: <repo>/.metaharness/bench/suite.json) | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "op": {
      "type": "string",
      "enum": [
        "create",
        "verify"
      ],
      "description": "create scaffolds suite.json from a repo; verify validates an existing suite"
    },
    "repo": {
      "type": "string",
      "description": "Repo path (required for --op create)"
    },
    "suite": {
      "type": "string",
      "description": "Suite JSON path (required for --op verify)"
    },
    "out": {
      "type": "string",
      "description": "Override default output path for --op create (default: <repo>/.metaharness/bench/suite.json)"
    }
  },
  "required": [
    "op"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "metaharness_bench",
  "arguments": {
    "op": "create"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## metaharness_redblue

출처: Ruflo 원본

### 기능과 사용 시점

Adversarial red/blue LLM testing via @metaharness/redblue — generates attacks across OWASP LLM Top-10 / NIST AI RMF families (prompt injection, tool misuse, data leakage, jailbreaks, denial-of-wallet), runs them against an LLM target YOU OWN, judges compromise, optionally applies declarative blue-team patches, retests, and emits a board-readable report with measured failure reduction. Use when shipping an LLM-powered product and you need a repeatable security gate before exposing it to users — eyeballing prompts is wrong because attack surface coverage requires the OWASP/NIST taxonomy and the judge has to be model-driven for jailbreak detection. SAFETY: upstream hard-enforces no-creds / no-live-targets / no-shell / no-network / no-eval at config-load time; cannot be relaxed via flags. For CI / offline use --mockJudge=true ($0 marker fixture). For real model judging set $OPENROUTER_API_KEY and accept the per-run cost capped by max_cost_usd (default $3). [Return shape: {success, data, degraded, exitCode}. success===true iff exitCode===0 (includes graceful-degradation path where dep is absent — check degraded for that). success===false with exitCode===1 = intentional alert exit (read data.alert.triggered). success===false with exitCode===2 = input error (data is null).]

### 연결·실행 조건

스키마·원본 설명에 계정/토큰 요건이 있습니다. 예시의 자리표시자를 실제 값으로 바꾸되 저장소에 커밋하지 마세요. AI 공급자 키와 서비스 접근 권한은 별개입니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| subcommand | string | 아니오 | init = scaffold redblue.yaml; run = baseline (+ optional --patch); patch = baseline → patch → retest delta; attack = preview attacks; report = render existing report.json | {"enum":["init","run","patch","attack","report"],"default":"run"} |
| config | string | 아니오 | Path to redblue.yaml (default: ./redblue.yaml) | — |
| out | string | 아니오 | Output report path for run/patch (default: temp file we read back inline) | — |
| in | string | 아니오 | Input report path for `report` subcommand | — |
| tests | number | 아니오 | How many test cases (run/patch only) | — |
| patch | boolean | 아니오 | `run` only — after baseline, apply blue-team patches and retest | {"default":false} |
| mockJudge | boolean | 아니오 | $0 TEST-ONLY marker fixture (no model calls). Use for CI / offline. Real judging requires OPENROUTER_API_KEY. | {"default":false} |
| family | string | 아니오 | `attack` subcommand only — which attack family to preview | {"enum":["prompt","tools","data","all"]} |
| count | number | 아니오 | `attack` only — how many cases to preview | — |
| alertOnFail | boolean | 아니오 | Exit 1 when post-patch verdict is FAIL (gate-style) | {"default":false} |
| timeoutMs | number | 아니오 | Subprocess hard timeout (default 120000; mock-judge runs complete in seconds) | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "subcommand": {
      "type": "string",
      "enum": [
        "init",
        "run",
        "patch",
        "attack",
        "report"
      ],
      "description": "init = scaffold redblue.yaml; run = baseline (+ optional --patch); patch = baseline → patch → retest delta; attack = preview attacks; report = render existing report.json",
      "default": "run"
    },
    "config": {
      "type": "string",
      "description": "Path to redblue.yaml (default: ./redblue.yaml)"
    },
    "out": {
      "type": "string",
      "description": "Output report path for run/patch (default: temp file we read back inline)"
    },
    "in": {
      "type": "string",
      "description": "Input report path for `report` subcommand"
    },
    "tests": {
      "type": "number",
      "description": "How many test cases (run/patch only)"
    },
    "patch": {
      "type": "boolean",
      "description": "`run` only — after baseline, apply blue-team patches and retest",
      "default": false
    },
    "mockJudge": {
      "type": "boolean",
      "description": "$0 TEST-ONLY marker fixture (no model calls). Use for CI / offline. Real judging requires OPENROUTER_API_KEY.",
      "default": false
    },
    "family": {
      "type": "string",
      "enum": [
        "prompt",
        "tools",
        "data",
        "all"
      ],
      "description": "`attack` subcommand only — which attack family to preview"
    },
    "count": {
      "type": "number",
      "description": "`attack` only — how many cases to preview"
    },
    "alertOnFail": {
      "type": "boolean",
      "description": "Exit 1 when post-patch verdict is FAIL (gate-style)",
      "default": false
    },
    "timeoutMs": {
      "type": "number",
      "description": "Subprocess hard timeout (default 120000; mock-judge runs complete in seconds)"
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "metaharness_redblue",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## metaharness_learn

출처: Ruflo 원본

### 기능과 사용 시점

ADR-235 (upstream) — GEPA learning run via `metaharness learn`: optimizes a harness genome against a SWE-bench-style slice manifest. $0 DRY-RUN BY DEFAULT — it resolves the slice and prices the run without model calls; pass run=true to actually spend (model calls + Docker sandboxes). Requires a local metaharness repo checkout (repo param or $METAHARNESS_REPO); without one the tool returns {status:"checkout-required"} with clone instructions — that is a precondition report, not an error. Use when you want the harness policy to LEARN from a task corpus rather than hand-editing prompts; manual prompt tweaking is wrong because GEPA scores candidates against held-out slices and only promotes measured winners. Long real runs exceed the 120s MCP subprocess budget — run those via `ruflo metaharness learn` in a terminal instead. [Return shape: {success, data, degraded, exitCode}. success===true iff exitCode===0 (includes graceful-degradation path where dep is absent — check degraded for that). success===false with exitCode===1 = intentional alert exit (read data.alert.triggered). success===false with exitCode===2 = input error (data is null).]

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| host | string | 아니오 | Target host harness (e.g. claude-code, codex, pi-dev, hermes) | — |
| model | string | 아니오 | Model to learn against (upstream model id) | — |
| slice | string | 아니오 | Path to a slice manifest JSON | — |
| repo | string | 아니오 | Path to a metaharness repo checkout (sets $METAHARNESS_REPO) | — |
| run | boolean | 아니오 | EXPLICIT SPEND OPT-IN — without this the run is a $0 dry-run | {"default":false} |
| alertOnFail | boolean | 아니오 | Exit 1 when the learn run reports failure | {"default":false} |
| timeoutMs | number | 아니오 | Subprocess hard timeout override | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "host": {
      "type": "string",
      "description": "Target host harness (e.g. claude-code, codex, pi-dev, hermes)"
    },
    "model": {
      "type": "string",
      "description": "Model to learn against (upstream model id)"
    },
    "slice": {
      "type": "string",
      "description": "Path to a slice manifest JSON"
    },
    "repo": {
      "type": "string",
      "description": "Path to a metaharness repo checkout (sets $METAHARNESS_REPO)"
    },
    "run": {
      "type": "boolean",
      "description": "EXPLICIT SPEND OPT-IN — without this the run is a $0 dry-run",
      "default": false
    },
    "alertOnFail": {
      "type": "boolean",
      "description": "Exit 1 when the learn run reports failure",
      "default": false
    },
    "timeoutMs": {
      "type": "number",
      "description": "Subprocess hard timeout override"
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "metaharness_learn",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## metaharness_gepa

출처: Ruflo 원본

### 기능과 사용 시점

GEPA genome operations from the `@metaharness/darwin/gepa` library entry (darwin 0.8.0). op=genome loads + validates a genome (default: the shipped cand-6 — first holdout-confirmed cheap-tier policy promotion, provenance in the package); op=validate returns structural errors for a genome JSON; op=render compiles a genome to the system prompt it encodes (inspect what a policy actually says before adopting it); op=analyze classifies failure modes in a transcript JSON array. Use when adopting/auditing/debugging evolved harness policies — reading genome JSON by eye is wrong because the behavior lives in the rendered system prompt and the component interactions, not the raw fields. NOTE: gepaOptimize (bring-your-own-evaluator optimization) is library-only — import @metaharness/darwin/gepa directly, or use metaharness_evolve for sandbox-scored evolution. [Return shape: {success, data, degraded, exitCode}. success===true iff exitCode===0 (includes graceful-degradation path where dep is absent — check degraded for that). success===false with exitCode===1 = intentional alert exit (read data.alert.triggered). success===false with exitCode===2 = input error (data is null).]

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| op | string | 예 | genome = load + validate; validate = structural errors only; render = genome → system prompt; analyze = transcript failure classes | {"enum":["genome","validate","render","analyze"]} |
| path | string | 아니오 | Genome JSON path (genome/validate/render; default: shipped cand-6) | — |
| transcript | string | 아니오 | Transcript JSON array path (required for op=analyze) | — |
| ext | string | 아니오 | render only — target file extension hint | — |
| glob | string | 아니오 | render only — target glob hint | — |
| alertOnInvalid | boolean | 아니오 | Exit 1 when validation finds errors (gate-style) | {"default":false} |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "op": {
      "type": "string",
      "enum": [
        "genome",
        "validate",
        "render",
        "analyze"
      ],
      "description": "genome = load + validate; validate = structural errors only; render = genome → system prompt; analyze = transcript failure classes"
    },
    "path": {
      "type": "string",
      "description": "Genome JSON path (genome/validate/render; default: shipped cand-6)"
    },
    "transcript": {
      "type": "string",
      "description": "Transcript JSON array path (required for op=analyze)"
    },
    "ext": {
      "type": "string",
      "description": "render only — target file extension hint"
    },
    "glob": {
      "type": "string",
      "description": "render only — target glob hint"
    },
    "alertOnInvalid": {
      "type": "boolean",
      "description": "Exit 1 when validation finds errors (gate-style)",
      "default": false
    }
  },
  "required": [
    "op"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "metaharness_gepa",
  "arguments": {
    "op": "genome"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## metaharness_flywheel

출처: Ruflo 원본

### 기능과 사용 시점

ADR-322 — evaluate candidates into immutable receipts, inspect the append-only promotion ledger, and explicitly promote one signed receipt with atomic compare-and-swap semantics. Use when running governed flywheel evaluation or promotion; evaluation never mutates the active champion, and promotion requires confirm=true plus a locally approved Ed25519 public-key PEM path.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| operation | string | 예 | Flywheel operation | {"enum":["run","status","receipts","history","promote","evidence-reset"],"default":"status"} |
| projectRoot | string | 아니오 | Target project root (default: active project cwd) | — |
| receiptId | string | 아니오 | Receipt content ID for promote | — |
| sample | number | 아니오 | Maximum harvested evaluation sample | {"default":40} |
| proposer | string | 아니오 | Candidate proposer. Auto fallback is evaluation-only; explicit darwin fails closed when no compatible adapter is installed. | {"enum":["local","auto","darwin"],"default":"auto"} |
| privateKeyPath | string | 아니오 | Local Ed25519 private-key PEM path for signing run receipts; must be paired with publicKeyPath | — |
| publicKeyPath | string | 아니오 | Local Ed25519 public-key PEM path used to sign a run or approve a promotion | — |
| confirm | boolean | 아니오 | Required for promote; never inferred | {"default":false} |
| maxConcurrency | number | 아니오 | ADR-324 hard local candidate-evaluation concurrency cap (1-8) | {"default":2} |
| timeoutMs | number | 아니오 | Abort concurrent evaluation after this wall-clock limit | {"default":120000} |
| anchorPath | string | 아니오 | Project-contained human-labelled anchor JSON; requires anchorHash | — |
| anchorHash | string | 아니오 | Pinned sha256 of canonical anchor tasks; requires anchorPath | — |
| anchorManifestPath | string | 아니오 | Project-contained anchor manifest path (default .claude/eval/flywheel-anchor.manifest.json) | — |
| approvalIds | array | 아니오 | Scoped ADR-324 approval IDs for privileged promotion | — |
| allowAggregateEvidence | boolean | 아니오 | Migration escape hatch: accept a pre-upgrade receipt without task-level pairedOutcomes. Default false — aggregate-only evidence is refused by the strict sequential-evidence gate. | {"default":false} |
| reason | string | 아니오 | Required for evidence-reset (ADR-381): the human intent recorded in the append-only reset audit trail. | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "operation": {
      "type": "string",
      "enum": [
        "run",
        "status",
        "receipts",
        "history",
        "promote",
        "evidence-reset"
      ],
      "description": "Flywheel operation",
      "default": "status"
    },
    "projectRoot": {
      "type": "string",
      "description": "Target project root (default: active project cwd)"
    },
    "receiptId": {
      "type": "string",
      "description": "Receipt content ID for promote"
    },
    "sample": {
      "type": "number",
      "description": "Maximum harvested evaluation sample",
      "default": 40
    },
    "proposer": {
      "type": "string",
      "enum": [
        "local",
        "auto",
        "darwin"
      ],
      "description": "Candidate proposer. Auto fallback is evaluation-only; explicit darwin fails closed when no compatible adapter is installed.",
      "default": "auto"
    },
    "privateKeyPath": {
      "type": "string",
      "description": "Local Ed25519 private-key PEM path for signing run receipts; must be paired with publicKeyPath"
    },
    "publicKeyPath": {
      "type": "string",
      "description": "Local Ed25519 public-key PEM path used to sign a run or approve a promotion"
    },
    "confirm": {
      "type": "boolean",
      "description": "Required for promote; never inferred",
      "default": false
    },
    "maxConcurrency": {
      "type": "number",
      "description": "ADR-324 hard local candidate-evaluation concurrency cap (1-8)",
      "default": 2
    },
    "timeoutMs": {
      "type": "number",
      "description": "Abort concurrent evaluation after this wall-clock limit",
      "default": 120000
    },
    "anchorPath": {
      "type": "string",
      "description": "Project-contained human-labelled anchor JSON; requires anchorHash"
    },
    "anchorHash": {
      "type": "string",
      "description": "Pinned sha256 of canonical anchor tasks; requires anchorPath"
    },
    "anchorManifestPath": {
      "type": "string",
      "description": "Project-contained anchor manifest path (default .claude/eval/flywheel-anchor.manifest.json)"
    },
    "approvalIds": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Scoped ADR-324 approval IDs for privileged promotion"
    },
    "allowAggregateEvidence": {
      "type": "boolean",
      "description": "Migration escape hatch: accept a pre-upgrade receipt without task-level pairedOutcomes. Default false — aggregate-only evidence is refused by the strict sequential-evidence gate.",
      "default": false
    },
    "reason": {
      "type": "string",
      "description": "Required for evidence-reset (ADR-381): the human intent recorded in the append-only reset audit trail."
    }
  },
  "required": [
    "operation"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "metaharness_flywheel",
  "arguments": {
    "operation": "status"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.
