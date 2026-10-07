# Seraphina 가이드

[전체 목차](../MANUAL.md) · [사용 순서](../WORKFLOWS.md)

- [seraphina_guidance](#seraphina_guidance)

## seraphina_guidance

출처: Ruflo 원본

### 기능과 사용 시점

Ask Seraphina — the swarm queen / primary coordinator — for coordination guidance on a goal. She reads the live open-federation roster, claims board and recent messages from x.ruv.io, reasons through the cognitum meta-llm gateway (cost-governed; cognitum-auto by default, override with tier), and returns guidance plus structured proposals (Task/Claim/Handoff/Status) and risks. Use when you need to decide what the swarm should do next, who should take a resource, or how to resolve a claim conflict. Hand-assigning work from raw sync output is wrong because it ignores current claims and node liveness, which Seraphina checks first. Proposals are advisory; publish them explicitly with x_federation_publish (admin) if you agree.

### 연결·실행 조건

해당 원본 외부 서비스/네트워크/서명·계정 설정을 따릅니다. BATON 대체 기능은 별도 도구이며 원본 호출의 의미를 바꾸지 않습니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| goal | string | 예 | What the operator wants the swarm to achieve or decide. | — |
| tier | string | 아니오 | Force a meta-llm tier; default cognitum-auto lets the gateway pick by difficulty. | {"enum":["cognitum-auto","cognitum-low","cognitum-mid","cognitum-high","cognitum-ultra"]} |
| sinceSeconds | number | 아니오 | Recent-message window for context (default 3600). | — |
| limit | number | 아니오 | Max recent messages in context (default 40). | — |
| gatewayUrl | string | 아니오 | Compatibility assertion: must match the server RUFLO_X_GATEWAY_URL. | — |
| metaLlmUrl | string | 아니오 | Compatibility assertion: must match the server SERAPHINA_METALLM_URL. | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "goal": {
      "type": "string",
      "description": "What the operator wants the swarm to achieve or decide."
    },
    "tier": {
      "type": "string",
      "enum": [
        "cognitum-auto",
        "cognitum-low",
        "cognitum-mid",
        "cognitum-high",
        "cognitum-ultra"
      ],
      "description": "Force a meta-llm tier; default cognitum-auto lets the gateway pick by difficulty."
    },
    "sinceSeconds": {
      "type": "number",
      "description": "Recent-message window for context (default 3600)."
    },
    "limit": {
      "type": "number",
      "description": "Max recent messages in context (default 40)."
    },
    "gatewayUrl": {
      "type": "string",
      "description": "Compatibility assertion: must match the server RUFLO_X_GATEWAY_URL."
    },
    "metaLlmUrl": {
      "type": "string",
      "description": "Compatibility assertion: must match the server SERAPHINA_METALLM_URL."
    }
  },
  "required": [
    "goal"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "seraphina_guidance",
  "arguments": {
    "goal": "<goal 입력>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.
