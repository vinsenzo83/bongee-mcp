# 사업 Pod 검증·백엔드 선택

[전체 목차](../MANUAL.md) · [사용 순서](../WORKFLOWS.md)

- [business_pod_validate](#business_pod_validate)
- [business_pod_route_backend](#business_pod_route_backend)

## business_pod_validate

출처: Ruflo 원본

### 기능과 사용 시점

ADR-164 Phase 2 — Validate a business-pod template JSON against the schema in ADR-164 §3.3 (name, agents[], allowedMcpTools, bench, piiPolicy, budgets, cronSchedule, auditReadView, reservationExpiryMs bounded by ADR-164.1 §3.2). Use when a /loop driver or CI workflow needs to pre-flight a pod template before pod-tick.mjs reaches it — surfacing validation as JSON keeps the optional-dep degraded path clean. Hand-parsing the JSON in the caller is wrong because it skips the JSON-pointer error path and the reservationExpiryMs [5000, 300000] ms bound check that ADR-164.1 mandates. Pair with business_pod_validate -> pod-tick.mjs in the sales-pod smoke contract.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| podTemplate | object | 예 | The pod template object to validate. Must conform to the PodTemplate interface from ADR-164 §3.3. | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "podTemplate": {
      "type": "object",
      "description": "The pod template object to validate. Must conform to the PodTemplate interface from ADR-164 §3.3."
    }
  },
  "required": [
    "podTemplate"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "business_pod_validate",
  "arguments": {
    "podTemplate": {}
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## business_pod_route_backend

출처: Ruflo 원본

### 기능과 사용 시점

ADR-164 Phase 3 — Compute the domain-affinity routing decision for a business pod per ADR-164 §3.4 and return {backend, reason}. The three backends are local-stdio (preferLocalExecution=true), cloud-managed (preferLocalExecution=false AND budgetUsdMonthly >= 50), and remote-peer (everything else — small-budget non-local pods route through a federation peer node). Use when a /loop driver, @metaharness/router policy hook, or operator CLI needs the structural routing pick BEFORE the cost-optimal KRR step — surfacing this as an MCP tool keeps the rule auditable from the pod template alone and lets non-TS callers reach it. Re-implementing the rule in the caller is wrong because it forks the §3.4 source-of-truth and skips the {success,valid,error,path} envelope shape callers already rely on from business_pod_validate. Pair with business_pod_validate when pre-flighting a template, since this tool also runs full schema validation and degrades to the same error shape on malformed input. Threshold lives in CLOUD_BUDGET_THRESHOLD_USD in domain-affinity-policy.ts — keep that constant and this description aligned.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| podTemplate | object | 아니오 | In-memory pod template object. One of podTemplate or podTemplatePath is required. | — |
| podTemplatePath | string | 아니오 | Absolute or cwd-relative path to a pod template JSON file. One of podTemplate or podTemplatePath is required. | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "podTemplate": {
      "type": "object",
      "description": "In-memory pod template object. One of podTemplate or podTemplatePath is required."
    },
    "podTemplatePath": {
      "type": "string",
      "description": "Absolute or cwd-relative path to a pod template JSON file. One of podTemplate or podTemplatePath is required."
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "business_pod_route_backend",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.
