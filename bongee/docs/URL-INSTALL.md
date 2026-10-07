# 주소로 Bongee 연결하기

MCP 주소: **https://bongee-production.up.railway.app/mcp**

MCP 클라이언트의 원격 서버 추가 화면에 위 주소를 입력합니다. 열리는 브라우저에서 **연결 허용**을 누르면 인증이 자동으로 처리됩니다. AI API 키나 연결 토큰을 복사해 입력하지 않습니다. 브라우저에서 주소를 열면 설치 안내가 표시됩니다.

## Codex

```sh
codex mcp add bongee --url https://bongee-production.up.railway.app/mcp
codex mcp login bongee
```

새 세션에서 MCP 연결을 확인하세요. 이미 열린 세션의 도구 목록이 설정 변경과 동시에 갱신되는지는 클라이언트에 따라 다릅니다.

## Claude Code

```sh
claude mcp add --transport http --scope user bongee https://bongee-production.up.railway.app/mcp
```

Claude Code의 `/mcp`에서 Bongee 인증을 선택하고 브라우저 연결을 허용합니다.

## 자신의 PC에서 작업 실행하기

서버 연결과 PC 실행기 연결은 별도입니다. 새로운 사용자는 설치 안내의 **내 PC 실행기 연결**에서 개인 연결 ZIP을 내려받습니다. 압축을 풀고 macOS에서는 `Bongee-Connect.command`를 실행하세요. Linux에서는 `bash Bongee-Connect.command`, Windows에서는 WSL을 사용합니다.

설치기는 공개 Bongee 소스의 SHA256을 확인하고 필요한 패키지를 설치합니다. 개인 연결 설정을 자동으로 저장하고 실행기를 시작합니다. 연결 토큰을 직접 입력하지 않습니다. Node.js 20 이상, npm, unzip과 인터넷 연결이 필요합니다. 실제 에이전트 실행에는 자신의 Codex 또는 Claude Code CLI 로그인이 필요하며 해당 계정의 이용 한도를 따릅니다.

서버에 실행기 연결이 확인된 후 작업을 요청하세요. 새 사용자의 작업은 자신의 실행기에 전달되며 다른 사용자의 PC나 작업 결과에 접근할 수 없습니다. PC가 꺼졌거나 실행기가 종료되면 작업 실행을 사용할 수 없습니다.

## 기능과 상태

`bongee_remote_provider_status`로 실행기 연결 및 CLI 로그인 상태를 확인합니다. 자동 개발은 `bongee_pipeline_start`로 시작합니다. 세션 실행·4단계 진행·실패 수정·실제 검증의 상세 사용법은 [자동 개발 설명서](AUTO-PIPELINE.md), 모든 도구의 입력은 [상세 매뉴얼](MANUAL.md)을 참고하세요.

OAuth 인증 및 실행기 연결 권한은 서버의 영구 저장소에 보관됩니다. 서버 재시작 후 실행기가 다시 연결할 수 있습니다. 원격 대기열과 결과는 메모리 기반이므로 서버 재시작 시 초기화됩니다. 로컬 실행기의 영구 작업 근거와 구분합니다.

## 연결 문제

- 주소를 입력했는데 인증 창이 열리지 않으면 클라이언트가 원격 Streamable HTTP MCP와 OAuth를 지원하는지 확인합니다.
- MCP 연결 후 실행기 미연결 안내가 나오면 내 PC 실행기를 연결하거나 다시 실행합니다.
- CLI 로그인 오류 또는 구독 한도 오류는 MCP 인증과 별개입니다. 자신의 CLI 로그인을 확인합니다.
- 공개 소스 ZIP은 프로그램 다운로드용입니다. 개인 실행기 연결 ZIP은 자신의 연결 권한을 포함하므로 다른 사람에게 전달하지 마세요.
