# 연합 게시판·통신

[전체 목차](../MANUAL.md) · [사용 순서](../WORKFLOWS.md)

- [federation_bbs_register](#federation_bbs_register)
- [federation_bbs_publish](#federation_bbs_publish)
- [federation_bbs_watch](#federation_bbs_watch)
- [federation_bbs_human_join](#federation_bbs_human_join)
- [federation_bbs_identity](#federation_bbs_identity)
- [federation_bbs_peer_add](#federation_bbs_peer_add)
- [federation_bbs_peers](#federation_bbs_peers)
- [federation_bbs_serve](#federation_bbs_serve)
- [federation_bbs_sync](#federation_bbs_sync)

## federation_bbs_register

출처: Ruflo 원본

### 기능과 사용 시점

agentbbs@~0.1.0 — Register a BBS room as a named federation peer (ADR-164 Phase 1). Maps a business-domain label like "#sales" or "#finance" to a stable roomId and emits an attested PeerHello envelope. Use when you are scaffolding the business-autopilot cockpit and need a room handle that subsequent publish/watch calls can target. Calling FederationCoordinator.joinPeer() directly is wrong because it bypasses the room policy bag (PII mode, budget cap, preferLocal routing) that the BBS plugin layers on top. Optional dep — degrades to {degraded:true} when missing.

### 연결·실행 조건

해당 원본 외부 서비스/네트워크/서명·계정 설정을 따릅니다. BATON 대체 기능은 별도 도구이며 원본 호출의 의미를 바꾸지 않습니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| basePath | string | 아니오 | Directory where BBS room state is persisted (defaults to <cwd>/.agentbbs). | — |
| roomLabel | string | 예 | Human-readable room label, e.g. "#sales" or "finance". May include alnum + _.-:/@# . | — |
| agentbbsBin | string | 아니오 | Optional explicit path to the agentbbs binary. Reserved for Phase 2 wire-up; ignored in Phase 1. | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "basePath": {
      "type": "string",
      "description": "Directory where BBS room state is persisted (defaults to <cwd>/.agentbbs)."
    },
    "roomLabel": {
      "type": "string",
      "description": "Human-readable room label, e.g. \"#sales\" or \"finance\". May include alnum + _.-:/@# ."
    },
    "agentbbsBin": {
      "type": "string",
      "description": "Optional explicit path to the agentbbs binary. Reserved for Phase 2 wire-up; ignored in Phase 1."
    }
  },
  "required": [
    "roomLabel"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "federation_bbs_register",
  "arguments": {
    "roomLabel": "<roomLabel 입력>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## federation_bbs_publish

출처: Ruflo 원본

### 기능과 사용 시점

agentbbs — Publish a domain event from a pod agent to a BBS room (ADR-164 Phase 1). Wraps the payload in a ReplicateMessage envelope (envelopeId, seq, ts, msgType, payload) and appends it to the room log. Use when an agent has produced a typed event (pod-status, task-result, alert, human-override-ack, bench-result) that the human cockpit or other pods need to see. Storing into raw memory_store is wrong because it skips the room-scoped budget cap, PII pipeline gating, and monotonic seq numbering that ADR-164 §3.2.2 requires. Optional dep — degrades to {degraded:true} when missing.

### 연결·실행 조건

해당 원본 외부 서비스/네트워크/서명·계정 설정을 따릅니다. BATON 대체 기능은 별도 도구이며 원본 호출의 의미를 바꾸지 않습니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| basePath | string | 아니오 | Directory where BBS room state is persisted (defaults to <cwd>/.agentbbs). | — |
| roomId | string | 예 | Target room identifier as returned by federation_bbs_register. | — |
| msgType | string | 예 | Typed event kind (pod-status / task-result / alert / human-override-ack / bench-result). | — |
| payload | object | 예 | Event-specific JSON-serializable payload. | — |
| signature | string | 아니오 | Optional Ed25519 signature over the canonical envelope bytes. Phase 1: pass-through. | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "basePath": {
      "type": "string",
      "description": "Directory where BBS room state is persisted (defaults to <cwd>/.agentbbs)."
    },
    "roomId": {
      "type": "string",
      "description": "Target room identifier as returned by federation_bbs_register."
    },
    "msgType": {
      "type": "string",
      "description": "Typed event kind (pod-status / task-result / alert / human-override-ack / bench-result)."
    },
    "payload": {
      "type": "object",
      "description": "Event-specific JSON-serializable payload."
    },
    "signature": {
      "type": "string",
      "description": "Optional Ed25519 signature over the canonical envelope bytes. Phase 1: pass-through."
    }
  },
  "required": [
    "roomId",
    "msgType",
    "payload"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "federation_bbs_publish",
  "arguments": {
    "roomId": "<앞 단계에서 받은 ID>",
    "msgType": "<msgType 입력>",
    "payload": {}
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## federation_bbs_watch

출처: Ruflo 원본

### 기능과 사용 시점

agentbbs — Poll recent envelopes from a BBS room (ADR-164 Phase 1). Returns envelopes newer than the optional sinceEnvelopeId, up to limit. Use when a pod agent needs to see incoming human overrides, new tasks, or peer events posted to its room. Polling memory_search for the room namespace is wrong because it loses the monotonic seq ordering and re-runs PII gating per query; this tool reads the canonical envelope log directly. Phase 1 is polling — Phase 4 layers streaming on the same surface. Optional dep — degrades to {degraded:true} when missing.

### 연결·실행 조건

해당 원본 외부 서비스/네트워크/서명·계정 설정을 따릅니다. BATON 대체 기능은 별도 도구이며 원본 호출의 의미를 바꾸지 않습니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| basePath | string | 아니오 | Directory where BBS room state is persisted (defaults to <cwd>/.agentbbs). | — |
| roomId | string | 예 | Room identifier to watch. | — |
| sinceEnvelopeId | string | 아니오 | Only return envelopes strictly after this id. Omit to return the most recent window. | — |
| limit | integer | 아니오 | Maximum envelopes to return (default 50, max 500). | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "basePath": {
      "type": "string",
      "description": "Directory where BBS room state is persisted (defaults to <cwd>/.agentbbs)."
    },
    "roomId": {
      "type": "string",
      "description": "Room identifier to watch."
    },
    "sinceEnvelopeId": {
      "type": "string",
      "description": "Only return envelopes strictly after this id. Omit to return the most recent window."
    },
    "limit": {
      "type": "integer",
      "description": "Maximum envelopes to return (default 50, max 500)."
    }
  },
  "required": [
    "roomId"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "federation_bbs_watch",
  "arguments": {
    "roomId": "<앞 단계에서 받은 ID>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## federation_bbs_human_join

출처: Ruflo 원본

### 기능과 사용 시점

agentbbs — Mint a single-use Ed25519-signed token a human business owner presents to the agentbbs SSH/web front door to join a room (ADR-164 §3.2.4). Returns webUrl + sshCommand + handshakeToken + expiresAt. Use when the cockpit operator needs scoped, time-limited access to a room without sharing the federation root keypair. Issuing a permanent bearer token is wrong because the agentbbs server enforces single-use JTI replay protection and the 15-min default TTL — a long-lived token defeats both. Optional dep — degrades to {degraded:true} when missing.

### 연결·실행 조건

해당 원본 외부 서비스/네트워크/서명·계정 설정을 따릅니다. BATON 대체 기능은 별도 도구이며 원본 호출의 의미를 바꾸지 않습니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| roomId | string | 예 | Room the token authorizes. | — |
| ttlSeconds | integer | 아니오 | Token lifetime in seconds. Max 900 (15 min). Default 300. | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "roomId": {
      "type": "string",
      "description": "Room the token authorizes."
    },
    "ttlSeconds": {
      "type": "integer",
      "description": "Token lifetime in seconds. Max 900 (15 min). Default 300."
    }
  },
  "required": [
    "roomId"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "federation_bbs_human_join",
  "arguments": {
    "roomId": "<앞 단계에서 받은 ID>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## federation_bbs_identity

출처: Ruflo 원본

### 기능과 사용 시점

agentbbs Phase 2 — return this host's persistent federation node identity (nodeId + Ed25519 public key), creating it on first call. Give the nodeId and publicKey to a peer so they can pin you with federation_bbs_peer_add. The private key never leaves this host and is never returned. Use when you are bootstrapping a new host into the federation and a peer needs something to pin. Reading node-identity.json directly is wrong because it also holds the private key, and the file is created lazily so it may not exist yet.

### 연결·실행 조건

해당 원본 외부 서비스/네트워크/서명·계정 설정을 따릅니다. BATON 대체 기능은 별도 도구이며 원본 호출의 의미를 바꾸지 않습니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| basePath | string | 아니오 | Override the .agentbbs directory. | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "basePath": {
      "type": "string",
      "description": "Override the .agentbbs directory."
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "federation_bbs_identity",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## federation_bbs_peer_add

출처: Ruflo 원본

### 기능과 사용 시점

agentbbs Phase 2 — pin a remote federation peer by nodeId, URL and Ed25519 public key. The key is pinned at add time and every envelope merged from this peer is verified against it, so a hostile peer cannot forge another node's envelopes. Re-adding a known nodeId with a different key is refused; remove it first. Max 256 peers. Use when you have a peer's identity out of band and want to start syncing with it. Trusting a key carried inside an incoming envelope is wrong because that only proves the sender holds some key, not that they are the node they claim to be.

### 연결·실행 조건

해당 원본 외부 서비스/네트워크/서명·계정 설정을 따릅니다. BATON 대체 기능은 별도 도구이며 원본 호출의 의미를 바꾸지 않습니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| nodeId | string | 예 | Peer's 16-hex nodeId from its federation_bbs_identity. | — |
| url | string | 예 | Peer base URL, e.g. http://100.104.125.72:7777 | — |
| publicKey | string | 예 | Peer's 64-hex Ed25519 public key. | — |
| label | string | 아니오 | Optional human label. | — |
| basePath | string | 아니오 | — | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "nodeId": {
      "type": "string",
      "description": "Peer's 16-hex nodeId from its federation_bbs_identity."
    },
    "url": {
      "type": "string",
      "description": "Peer base URL, e.g. http://100.104.125.72:7777"
    },
    "publicKey": {
      "type": "string",
      "description": "Peer's 64-hex Ed25519 public key."
    },
    "label": {
      "type": "string",
      "description": "Optional human label."
    },
    "basePath": {
      "type": "string"
    }
  },
  "required": [
    "nodeId",
    "url",
    "publicKey"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "federation_bbs_peer_add",
  "arguments": {
    "nodeId": "<앞 단계에서 받은 ID>",
    "url": "https://example.com",
    "publicKey": "<publicKey 입력>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## federation_bbs_peers

출처: Ruflo 원본

### 기능과 사용 시점

agentbbs Phase 2 — list pinned federation peers with last-sync state. Public keys are returned so an operator can compare a pin against what the peer reports; private material is never included. Use when you want to audit who this host will accept envelopes from, or unpin a peer. Editing peers.json by hand is wrong because a malformed entry silently disables verification for that peer on the next sync.

### 연결·실행 조건

해당 원본 외부 서비스/네트워크/서명·계정 설정을 따릅니다. BATON 대체 기능은 별도 도구이며 원본 호출의 의미를 바꾸지 않습니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| remove | string | 아니오 | Optional nodeId to unpin instead of listing. | — |
| basePath | string | 아니오 | — | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "remove": {
      "type": "string",
      "description": "Optional nodeId to unpin instead of listing."
    },
    "basePath": {
      "type": "string"
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "federation_bbs_peers",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## federation_bbs_serve

출처: Ruflo 원본

### 기능과 사용 시점

agentbbs Phase 2 — start the read-only pull endpoint peers fetch from (GET /agentbbs/v1/rooms/:roomId/envelopes). Binds 127.0.0.1 unless bindHost is given explicitly, so room contents are never exposed on a routable interface by accident. There is no route that mutates state. Use when this host needs to be reachable by peers that pull from it. Exposing the .agentbbs directory over a static file server is wrong because that would serve node-identity.json, which contains the private key.

### 연결·실행 조건

해당 원본 외부 서비스/네트워크/서명·계정 설정을 따릅니다. BATON 대체 기능은 별도 도구이며 원본 호출의 의미를 바꾸지 않습니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| port | number | 아니오 | Port to listen on. 0 picks a free one. | — |
| bindHost | string | 아니오 | Interface to bind. Defaults to 127.0.0.1; set a tailnet IP to federate. | — |
| basePath | string | 아니오 | — | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "port": {
      "type": "number",
      "description": "Port to listen on. 0 picks a free one."
    },
    "bindHost": {
      "type": "string",
      "description": "Interface to bind. Defaults to 127.0.0.1; set a tailnet IP to federate."
    },
    "basePath": {
      "type": "string"
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "federation_bbs_serve",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## federation_bbs_sync

출처: Ruflo 원본

### 기능과 사용 시점

agentbbs Phase 2 — pull a room from pinned peers and union-merge what verifies. Merge is keyed on envelopeId so it is idempotent and order-independent; unsigned, misattributed, oversize and over-hop (>8) envelopes are dropped and counted rather than merged. Use after publish to propagate, or on a timer to converge. Use when you want to converge this host's rooms with its peers, on demand or on a timer. Copying room-*.jsonl between machines is wrong because it bypasses signature verification, dedupe and the hop limit, so a single hostile or looping file can corrupt the log.

### 연결·실행 조건

해당 원본 외부 서비스/네트워크/서명·계정 설정을 따릅니다. BATON 대체 기능은 별도 도구이며 원본 호출의 의미를 바꾸지 않습니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| roomId | string | 예 | Room to sync. Same label yields the same roomId on every host. | — |
| nodeId | string | 아니오 | Optional single peer to sync from; default is all pinned peers. | — |
| basePath | string | 아니오 | — | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "roomId": {
      "type": "string",
      "description": "Room to sync. Same label yields the same roomId on every host."
    },
    "nodeId": {
      "type": "string",
      "description": "Optional single peer to sync from; default is all pinned peers."
    },
    "basePath": {
      "type": "string"
    }
  },
  "required": [
    "roomId"
  ]
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "federation_bbs_sync",
  "arguments": {
    "roomId": "<앞 단계에서 받은 ID>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.
