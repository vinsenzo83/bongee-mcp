# 성능 측정·최적화

[전체 목차](../MANUAL.md) · [사용 순서](../WORKFLOWS.md)

- [performance_report](#performance_report)
- [performance_bottleneck](#performance_bottleneck)
- [performance_benchmark](#performance_benchmark)
- [performance_profile](#performance_profile)
- [performance_optimize](#performance_optimize)
- [performance_metrics](#performance_metrics)

## performance_report

출처: Ruflo 원본

### 기능과 사용 시점

Generate performance report Use when native shell timing (`time`, `hyperfine`) is wrong because you want Ruflo-aware benchmarks — HNSW search latency, breaker decisions/sec, MCP response p50/p95, embeddings throughput. For OS-level process profiling, native shell + perf are fine.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| timeRange | string | 아니오 | Time range (1h, 24h, 7d) | — |
| format | string | 아니오 | Report format | {"enum":["json","summary","detailed"]} |
| components | array | 아니오 | Components to include | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "timeRange": {
      "type": "string",
      "description": "Time range (1h, 24h, 7d)"
    },
    "format": {
      "type": "string",
      "enum": [
        "json",
        "summary",
        "detailed"
      ],
      "description": "Report format"
    },
    "components": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Components to include"
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "performance_report",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## performance_bottleneck

출처: Ruflo 원본

### 기능과 사용 시점

Detect performance bottlenecks Use when native shell timing (`time`, `hyperfine`) is wrong because you want Ruflo-aware benchmarks — HNSW search latency, breaker decisions/sec, MCP response p50/p95, embeddings throughput. For OS-level process profiling, native shell + perf are fine.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| component | string | 아니오 | Component to analyze | — |
| threshold | number | 아니오 | Alert threshold | — |
| deep | boolean | 아니오 | Deep analysis | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "component": {
      "type": "string",
      "description": "Component to analyze"
    },
    "threshold": {
      "type": "number",
      "description": "Alert threshold"
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
  "name": "performance_bottleneck",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## performance_benchmark

출처: Ruflo 원본

### 기능과 사용 시점

Run performance benchmarks Use when native shell timing (`time`, `hyperfine`) is wrong because you want Ruflo-aware benchmarks — HNSW search latency, breaker decisions/sec, MCP response p50/p95, embeddings throughput. For OS-level process profiling, native shell + perf are fine.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| suite | string | 아니오 | Benchmark suite | {"enum":["all","memory","neural","swarm","io"]} |
| iterations | number | 아니오 | Number of iterations | — |
| warmup | boolean | 아니오 | Include warmup phase | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "suite": {
      "type": "string",
      "enum": [
        "all",
        "memory",
        "neural",
        "swarm",
        "io"
      ],
      "description": "Benchmark suite"
    },
    "iterations": {
      "type": "number",
      "description": "Number of iterations"
    },
    "warmup": {
      "type": "boolean",
      "description": "Include warmup phase"
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "performance_benchmark",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## performance_profile

출처: Ruflo 원본

### 기능과 사용 시점

Profile specific component or operation Use when native shell timing (`time`, `hyperfine`) is wrong because you want Ruflo-aware benchmarks — HNSW search latency, breaker decisions/sec, MCP response p50/p95, embeddings throughput. For OS-level process profiling, native shell + perf are fine.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| target | string | 아니오 | Component to profile | — |
| duration | number | 아니오 | Profile duration in seconds | — |
| sampleRate | number | 아니오 | Sampling rate | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "target": {
      "type": "string",
      "description": "Component to profile"
    },
    "duration": {
      "type": "number",
      "description": "Profile duration in seconds"
    },
    "sampleRate": {
      "type": "number",
      "description": "Sampling rate"
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "performance_profile",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## performance_optimize

출처: Ruflo 원본

### 기능과 사용 시점

Apply performance optimizations Use when native shell timing (`time`, `hyperfine`) is wrong because you want Ruflo-aware benchmarks — HNSW search latency, breaker decisions/sec, MCP response p50/p95, embeddings throughput. For OS-level process profiling, native shell + perf are fine.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| target | string | 아니오 | Optimization target | {"enum":["memory","latency","throughput","all"]} |
| aggressive | boolean | 아니오 | Apply aggressive optimizations | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "target": {
      "type": "string",
      "enum": [
        "memory",
        "latency",
        "throughput",
        "all"
      ],
      "description": "Optimization target"
    },
    "aggressive": {
      "type": "boolean",
      "description": "Apply aggressive optimizations"
    }
  }
}
```

### 호출 예시

아래는 필수 입력 중심의 호출 틀입니다. 자리표시자를 실제 작업 값으로 교체하고, 중첩 객체·동작별 추가 요건은 위 설명과 스키마에 따라 채우세요. 이 예시는 자동 실행하지 않습니다.

```json
{
  "name": "performance_optimize",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.

## performance_metrics

출처: Ruflo 원본

### 기능과 사용 시점

Get detailed performance metrics Use when native shell timing (`time`, `hyperfine`) is wrong because you want Ruflo-aware benchmarks — HNSW search latency, breaker decisions/sec, MCP response p50/p95, embeddings throughput. For OS-level process profiling, native shell + perf are fine.

### 연결·실행 조건

로컬 Ruflo 실행 환경과 해당 기능의 상태·데이터를 준비합니다. 세부 선택적 의존성은 원본 구현과 서버 오류를 확인합니다.

### 입력 전체

| 필드 | 자료형 | 필수 | 설명 | 선택값·기본값·제약 |
|---|---|---|---|---|
| metric | string | 아니오 | Metric type | {"enum":["cpu","memory","latency","throughput","all"]} |
| aggregation | string | 아니오 | Aggregation method | {"enum":["avg","min","max","p50","p95","p99"]} |
| timeRange | string | 아니오 | Time range | — |

전체 스키마(분기·패턴·추가 속성 규칙 포함):

```json
{
  "type": "object",
  "properties": {
    "metric": {
      "type": "string",
      "enum": [
        "cpu",
        "memory",
        "latency",
        "throughput",
        "all"
      ],
      "description": "Metric type"
    },
    "aggregation": {
      "type": "string",
      "enum": [
        "avg",
        "min",
        "max",
        "p50",
        "p95",
        "p99"
      ],
      "description": "Aggregation method"
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
  "name": "performance_metrics",
  "arguments": {}
}
```

### 결과 확인과 오류 대응

MCP 응답의 content와 isError를 확인합니다. ID·코드·세션·경로를 반환하면 실제 응답 값을 후속 도구에 전달합니다. 실패 시 필수 입력, 앞 단계의 상태, 선택적 패키지, 외부 연결·권한을 순서대로 확인합니다. 쓰기·명령·배포·전송 작업은 이미 반영됐을 수 있으므로 오류만으로 자동 재시도하지 마세요.

서버 카탈로그에 고정 출력 스키마가 제공되지 않았습니다. 기능별 실제 출력과 성공 조건은 원본 구현/실제 응답을 확인해야 하며, 이 항목은 개별 동작 시험 완료를 뜻하지 않습니다.
