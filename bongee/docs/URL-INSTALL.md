# MCP 주소로 자동 설치하기

MCP 주소: **https://bongee-production.up.railway.app/mcp**

1. Codex 또는 Claude Code의 원격 MCP 서버 추가 화면에 위 주소를 등록합니다.
2. 열리는 브라우저에서 **연결 허용**을 누릅니다. 연결 토큰이나 AI API 키를 복사하지 않습니다.
3. 연결한 세션에서 **“Bongee로 작업해”**라고 요청합니다. 세션이 실행기 상태를 확인하고 첫 사용 PC의 설치·의존성 준비·개인 연결 설정·실행기 시작을 자동으로 처리합니다.

사용자가 소스 ZIP을 내려받고 설치 명령을 직접 입력하는 과정은 기본 설치 흐름에 없습니다. 브라우저에서 MCP 주소를 열면 연결 안내가 표시됩니다.

## 세션에서 자동으로 처리하는 일

서버의 시작 안내에 따라 호스트 세션은 `bongee_auto_setup`을 호출합니다. 이미 연결돼 있으면 기존 실행기를 사용합니다. 새 PC에서는 일회용 준비 명령을 받아 호스트의 터미널에서 실행합니다. 설치기는 공개 소스의 SHA256을 검증하고 필요한 패키지와 개인 연결 설정을 준비한 뒤 실행기를 시작합니다. 호스트는 실행기 응답을 확인한 후 요청한 작업을 이어갑니다. 시작 명령을 실행했다는 이유만으로 준비 완료라고 표시하지 않습니다.

터미널을 사용할 수 있는 Codex·Claude Code 세션, Node.js 20 이상, npm, unzip과 인터넷 연결이 필요합니다. macOS·Linux를 지원하며 Windows는 WSL을 사용합니다. 앱의 명령 승인 정책에 따라 실행 허용이 표시될 수 있습니다. MCP 주소가 운영체제의 실행 권한을 부여하는 것은 아니므로 터미널이 없는 채팅 앱에서는 PC 자동 설치가 실행되지 않습니다.

실제 에이전트는 자신의 Codex 또는 Claude Code CLI 로그인으로 실행하며 해당 계정의 이용 한도를 따릅니다. 자동 설치 과정에서 AI API 키를 요구하지 않습니다. 다른 사람의 PC 실행기로 연결하거나 다른 사람의 작업 결과를 열지 않습니다.

## 연결 후 사용

새 세션에서 `Bongee 자동 준비 후 /프로젝트/절대경로를 검토해` 또는 `Bongee로 새 서비스를 개발해`라고 요청합니다. 이미 열린 세션의 도구 목록이 설정 변경과 동시에 갱신되는지는 클라이언트에 따라 다릅니다. Claude Code는 `/mcp`에서 Bongee 인증을 선택할 수 있습니다.

`bongee_auto_setup`은 자동 준비 여부와 실행기 상태를 반환합니다. `bongee_remote_provider_status`는 실행기 및 CLI 로그인 상태를 확인합니다. 자동 개발은 `bongee_pipeline_start`로 시작합니다. [자동 개발 설명서](AUTO-PIPELINE.md)와 [상세 기능 매뉴얼](MANUAL.md)을 참고하세요.

PC가 꺼졌거나 실행기가 종료되면 작업 실행을 사용할 수 없습니다. 세션에서 자동 준비를 다시 요청하세요. OAuth 인증 및 실행기 연결 권한은 서버의 영구 저장소에 보관됩니다. 원격 대기열과 결과는 메모리 기반이므로 서버 재시작 시 초기화되며 로컬 실행기의 영구 작업 근거와 구분합니다.

## 연결 문제와 고급 설치

- 인증 창이 열리지 않으면 클라이언트의 Streamable HTTP MCP·OAuth 지원 여부를 확인합니다.
- 자동 준비 명령이 실행되지 않으면 호스트 세션의 터미널 사용과 명령 승인 상태를 확인합니다. 호스트가 서버 시작 안내를 따르지 않는 경우 `bongee_auto_setup을 호출하고 자동 준비해`라고 요청합니다.
- CLI 로그인·구독 한도 오류는 MCP 인증과 별개입니다. 자신의 CLI 로그인을 확인합니다.
- [공개 소스 ZIP](https://github.com/vinsenzo83/bongee-mcp/releases)은 선택 사항입니다. 자체 서버 운영이나 별도 PC 설치는 [README](../README.md)를 참고하세요. 개인 연결 파일은 자신의 권한을 포함하므로 공유하지 마세요.

고급 CLI 등록 예시:

```sh
codex mcp add bongee --url https://bongee-production.up.railway.app/mcp
codex mcp login bongee
claude mcp add --transport http --scope user bongee https://bongee-production.up.railway.app/mcp
```
