# BATON 검증 계획·신호

[전체 목차](../MANUAL.md) · [사용 순서](../WORKFLOWS.md)

- [spider_plan](#spider_plan)
- [spider_classify_tier](#spider_classify_tier)
- [spider_checklist](#spider_checklist)
- [spider_signals](#spider_signals)
- [spider_record_pattern](#spider_record_pattern)
- [spider_pull_corpus](#spider_pull_corpus)

## spider_plan

출처: BATON 실제 서버

### 기능과 사용 시점

대상에 대한 거미줄 검증 계획을 반환: 던질 거미(차원·등급·모델), 우선 점검할 학습 패턴, 절대원칙. 라운드 시작 시 호출.

### 연결·실행 조건

BATON 서버 네트워크 연결. 계정 권한은 아래 실제 스키마의 api_key 등 필수 여부를 따릅니다. 익명 연결 성공은 모든 관리 기능의 사용 권한을 뜻하지 않습니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| target | string | 예 | 검증 대상(레포/기능/배포 범위) | — |
| thorough | boolean | 아니오 | true면 거미 수↑·다수결 강화 | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "target": {
      "type": "string",
      "description": "검증 대상(레포/기능/배포 범위)"
    },
    "thorough": {
      "description": "true면 거미 수↑·다수결 강화",
      "type": "boolean"
    }
  },
  "required": [
    "target"
  ],
  "$schema": "http://json-schema.org/draft-07/schema#"
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "spider_plan",
  "arguments": {
    "target": "<target 입력>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## spider_classify_tier

출처: BATON 실제 서버

### 기능과 사용 시점

finding을 King/Mid/Baby 거미로 분류하고 모델·검증표수를 반환. 수정 거미 급파 전 호출. 비용·권한상승·순서무결성 경로 반영.

### 연결·실행 조건

BATON 서버 네트워크 연결. 계정 권한은 아래 실제 스키마의 api_key 등 필수 여부를 따릅니다. 익명 연결 성공은 모든 관리 기능의 사용 권한을 뜻하지 않습니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| severity | string | 아니오 | — | {"enum":["red","yellow","green"]} |
| area | string | 예 | 영역 키워드(payment, definer, budget, order, event 등) | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "severity": {
      "type": "string",
      "enum": [
        "red",
        "yellow",
        "green"
      ]
    },
    "area": {
      "type": "string",
      "description": "영역 키워드(payment, definer, budget, order, event 등)"
    }
  },
  "required": [
    "area"
  ],
  "$schema": "http://json-schema.org/draft-07/schema#"
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "spider_classify_tier",
  "arguments": {
    "area": "<area 입력>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## spider_checklist

출처: BATON 실제 서버

### 기능과 사용 시점

차원별 전수 체크리스트(증거 없이 PASS 금지)를 반환. 파일 부재 시 내장 체크리스트 + 세션 실증 그물코(권한상승·순서·비용·이벤트) 병합.

### 연결·실행 조건

BATON 서버 네트워크 연결. 계정 권한은 아래 실제 스키마의 api_key 등 필수 여부를 따릅니다. 익명 연결 성공은 모든 관리 기능의 사용 권한을 뜻하지 않습니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| dimension | string | 아니오 | 인증/데이터/단위/끊긴고리/권한경계/폴백/런타임/순서/비용/이벤트 등 | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "dimension": {
      "description": "인증/데이터/단위/끊긴고리/권한경계/폴백/런타임/순서/비용/이벤트 등",
      "type": "string"
    }
  },
  "$schema": "http://json-schema.org/draft-07/schema#"
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "spider_checklist",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## spider_signals

출처: BATON 실제 서버

### 기능과 사용 시점

실증 버그 클래스의 탐지 신호(라이브 쿼리/grep)와 수정 원칙을 반환. klass/tier/tag로 필터. 계획 후 이 신호를 그대로 실행해 증거를 수집하라.

### 연결·실행 조건

BATON 서버 네트워크 연결. 계정 권한은 아래 실제 스키마의 api_key 등 필수 여부를 따릅니다. 익명 연결 성공은 모든 관리 기능의 사용 권한을 뜻하지 않습니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| klass | string | 아니오 | 버그 클래스 부분일치(권한경계/순서무결성/비용공격/이벤트계약/단위 등) | — |
| tier | string | 아니오 | — | {"enum":["king","mid","baby"]} |
| tag | string | 아니오 | 스택 태그(postgres, stream, curriculum 등) | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "klass": {
      "description": "버그 클래스 부분일치(권한경계/순서무결성/비용공격/이벤트계약/단위 등)",
      "type": "string"
    },
    "tier": {
      "type": "string",
      "enum": [
        "king",
        "mid",
        "baby"
      ]
    },
    "tag": {
      "description": "스택 태그(postgres, stream, curriculum 등)",
      "type": "string"
    }
  },
  "$schema": "http://json-schema.org/draft-07/schema#"
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "spider_signals",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## spider_record_pattern

출처: BATON 실제 서버

### 기능과 사용 시점

이번 라운드에 잡은 버그를 학습 corpus에 1줄 패턴으로 증류 추가(다음 라운드에 먼저 점검). 실제로 잡은 것만.

### 연결·실행 조건

BATON 서버 네트워크 연결. 계정 권한은 아래 실제 스키마의 api_key 등 필수 여부를 따릅니다. 익명 연결 성공은 모든 관리 기능의 사용 권한을 뜻하지 않습니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| klass | string | 예 | 버그 클래스(단위/제약·끊긴고리·권한경계 등) | — |
| name | string | 예 | 짧은 이름 | — |
| signal | string | 예 | 탐지 신호 — 어떤 쿼리/grep/코드위치로 잡는가 | — |
| fix | string | 예 | 수정 원칙 | — |
| hit | string | 예 | 적중 예시(프로젝트·날짜·file:line) | — |
| tags | string | 아니오 | 스택 태그 쉼표(postgres,stream,curriculum 등) | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "klass": {
      "type": "string",
      "description": "버그 클래스(단위/제약·끊긴고리·권한경계 등)"
    },
    "name": {
      "type": "string",
      "description": "짧은 이름"
    },
    "signal": {
      "type": "string",
      "description": "탐지 신호 — 어떤 쿼리/grep/코드위치로 잡는가"
    },
    "fix": {
      "type": "string",
      "description": "수정 원칙"
    },
    "hit": {
      "type": "string",
      "description": "적중 예시(프로젝트·날짜·file:line)"
    },
    "tags": {
      "description": "스택 태그 쉼표(postgres,stream,curriculum 등)",
      "type": "string"
    }
  },
  "required": [
    "klass",
    "name",
    "signal",
    "fix",
    "hit"
  ],
  "$schema": "http://json-schema.org/draft-07/schema#"
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "spider_record_pattern",
  "arguments": {
    "klass": "<klass 입력>",
    "name": "<name 입력>",
    "signal": "<signal 입력>",
    "fix": "<fix 입력>",
    "hit": "<hit 입력>"
  }
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## spider_pull_corpus

출처: BATON 실제 서버

### 기능과 사용 시점

공유 corpus(집단 거미 두뇌)에서 검증된 패턴을 가져온다. verified 우선·tag/klass 필터. 원격 미설정/실패 시 내장 corpus로 graceful 폴백. 라운드 시작 시 알려진 함정 우선 점검용.

### 연결·실행 조건

BATON 서버 네트워크 연결. 계정 권한은 아래 실제 스키마의 api_key 등 필수 여부를 따릅니다. 익명 연결 성공은 모든 관리 기능의 사용 권한을 뜻하지 않습니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| tags | string | 아니오 | 스택 태그 쉼표(postgres,nextjs,payment 등) | — |
| klass | string | 아니오 | — | — |
| verified | boolean | 아니오 | true(기본)=합의검증된 패턴 우선. false=미검증 포함 | — |
| limit | number | 아니오 | — | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "tags": {
      "description": "스택 태그 쉼표(postgres,nextjs,payment 등)",
      "type": "string"
    },
    "klass": {
      "type": "string"
    },
    "verified": {
      "description": "true(기본)=합의검증된 패턴 우선. false=미검증 포함",
      "type": "boolean"
    },
    "limit": {
      "type": "number"
    }
  },
  "$schema": "http://json-schema.org/draft-07/schema#"
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "spider_pull_corpus",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.
