# bongee MCP

Ruflo 원본 전체 소스와 도구를 보존하면서, 별도 AI API 키 없이 Codex·Claude Code 기존 로그인으로 작업하는 MCP입니다. MIT 원본 라이선스·저작권을 유지합니다.

## 다운로드·설치

**주소로 연결:** `https://bongee-production.up.railway.app/mcp`를 원격 MCP에 등록하고 브라우저에서 연결을 허용하세요. 토큰 복사 없이 자동 인증됩니다. [Codex·Claude Code 주소 설치와 내 PC 실행기 연결](docs/URL-INSTALL.md).

```sh
git clone https://github.com/vinsenzo83/bongee-mcp.git
cd bongee-mcp/bongee
npm install
```

Node.js20+, Codex 또는 Claude Code CLI가 필요합니다. 원본 전체 코드는 상위 폴더에 있습니다. `npm install`은 고정된 Ruflo3.54.1 실행 패키지를 설치하고 복제본의 세션 공급자 수정사항을 적용합니다. 원본 기능의 연결·설치 요구사항까지 모두 사라지는 것은 아닙니다.

이미 로그인돼 있으면 추가 API 키 없이 실행합니다. 본인이 `codex login` 또는 `claude auth login`으로 로그인할 수 있습니다. 계정 제한·사용량은 해당 서비스 정책을 따릅니다.

설치 폴더의 절대 경로로 등록하세요:

```sh
codex mcp add bongee -- node /absolute/path/bongee-mcp/bongee/proxy-server.mjs
claude mcp add --scope user bongee -- node /absolute/path/bongee-mcp/bongee/proxy-server.mjs
```

## 기능

**자동 개발:** `bongee_pipeline_start` 한 번으로 기획·설계·개발·실제 검증, 실패 후 수정과 재검증을 실행합니다. [자동 개발 상세 설명서](docs/AUTO-PIPELINE.md)를 보세요.

상세 실행 순서는 [사용 설명서](docs/USAGE.md)와 [작업별 예제](docs/WORKFLOWS.md)를 보세요. **원본 358개를 포함한 전체 424개 도구의 개별 설명·모든 입력 스키마·호출 예시**는 [상세 기능 매뉴얼](docs/MANUAL.md)에 있습니다. 원본 이름·입력 스키마 대조 결과 누락 0개·변경 0개입니다. 기능별 실제 실행 검증 범위와는 구분합니다.

### 세션 하단 역할별 상태

**기획 → 설계·디자인 → 개발 → 검증**으로 실제 역할의 상태를 표시합니다. Claude Code 하단은 `npm run statusline:install`로 연결하며 기존 상태줄을 보존합니다. Codex는 별도 분할 터미널에서 `node monitor.mjs --watch --cwd /프로젝트/절대경로`로 확인합니다. `bongee_monitor_status`로도 조회할 수 있습니다. [하단 표시 설치·예시·복구·관찰 범위](docs/STATUS-DISPLAY.md).

- Ruflo 원본 도구358개와 전체 원본 코드 보존. 등록은 모든 도구가 설정·검증 완료됐다는 뜻이 아닙니다.
- `bongee_agent_start/status/result/cancel/list`, `bongee_provider_status`: Codex·Claude 세션 실행·조회. 기본 읽기 전용, 실행 프로세스당 동시2개, 제한시간 기본180초.
- 기존 `agent_execute` 공통 모델 호출 경로에도 로그인 세션 공급자 추가. 기본 Codex, `BONGEE_SESSION_PROVIDER=claude`로 선택. 원본 외부 API 경로는 소스에 보존.
- `bongee_baton_status` 및 BATON의 실제 도구45개: 암호화 인계·수신·차이·검증·팀 방. 원격 연결 성공 시 노출됩니다. 원격은 일반 네트워크 연결이 필요하고, 일부 계정 관리 기능은 BATON 계정 권한이 필요합니다.
- 원본 모델 가격으로 세션 구독 비용을 임의 계산하지 않습니다. 현재 세션과 전체 대화를 자동 공유하지 않으므로 작업 맥락을 prompt에 넣어야 합니다.

CLI 호출에서 API 키 환경변수를 전달하지 않습니다. Claude의 읽기 모드는 도구 제한이며 Codex OS 샌드박스와 동일하지 않습니다. 종료 코드뿐 아니라 정상 결과 이벤트를 확인합니다. 실제 로그인 상태·구독 한도에 따라 실행이 실패할 수 있습니다.

## 원격 MCP 서버

Endpoint: `https://bongee-production.up.railway.app/mcp`

주소 등록 후 브라우저에서 연결을 허용하면 OAuth 인증이 자동으로 처리됩니다. 브라우저로 위 주소를 열면 설치 안내를 볼 수 있습니다. 별도 AI API 키나 수동 연결 토큰 입력은 필요하지 않습니다.

새 사용자는 안내의 내 PC 실행기 연결에서 개인 ZIP을 내려받고 실행합니다. 공개 소스 검증·의존성 설치·개인 연결 설정 저장·실행기 시작을 자동 처리합니다. 실제 작업에는 자신의 기존 Codex 또는 Claude Code CLI 로그인이 필요합니다. 작업과 결과는 사용자별로 분리됩니다. [상세 설치 설명서](docs/URL-INSTALL.md).

```sh
BONGEE_GATEWAY_URL=https://your-gateway.example \
BONGEE_GATEWAY_TOKEN=<your-private-connection-token> node runner.mjs
```

위 환경변수 실행 방식은 자체 서버 운영자의 관리 연결입니다. 자체 서버는 `BONGEE_GATEWAY_TOKEN`, `BONGEE_PUBLIC_URL`, 영구 저장 위치 `BONGEE_STATE_DIR`를 설정하고 `npm run start:gateway`로 시작합니다. 개인 연결 ZIP의 권한 정보와 CLI 자격증명은 공개 소스 ZIP·저장소에 포함하지 않습니다.

원격에서 전체 로컬 도구가 전달되고 원격 작업 관리6개가 추가됩니다. 로컬 실행기가 켜져 있어야 합니다. 서버 재시작 시 원격 작업 기록이 초기화됩니다. 긴 원본 호출은 대기ID를 반환할 수 있으며 `bongee_remote_agent_result`로 확인합니다. 도구 취소는 이미 발생한 외부 변경을 되돌리지 않습니다.

## 검증

`npm test`: 세션 프로세스 수명·중단·잘못된 완료·자격증명 제외·영구기록·BATON 어댑터·실제HTTP 인증/큐/원본 호출 전달 검사.

`node check-local.mjs --execute` / `--claude`: 자신의 로그인으로 실제 모델 실행. 전체358개 도구의 기능별 검증은 별도로 필요합니다. 최신 구현에서 Codex 실호출 성공, Claude는 정상 로그인 후 구독 주간 한도 오류를 실패로 처리했습니다.

## 외부 연동 대체 범위

코드 작성·검토·테스트는 기존 로그인 세션, 웹 검사는 로컬 브라우저, 메모리는 로컬 DB/임베딩 모델을 사용합니다. GitHub는 `gh` 로그인으로 연결합니다. IPFS/Nostr 대신 봉이 BATON을 기본 작업 인계·팀 통신에 사용합니다. IPFS의 영구 임의파일 저장이나 Nostr의 연합망과 동일한 기능이라고 주장하지 않습니다. Anthropic Managed Agents의 원격 컨테이너 등 원본 외부서비스 전용 기능은 원본 그대로 남아 있고 세션으로 동일하게 대체되지 않습니다.

자세한 BATON 범위: [BATON-INTEGRATION.md](docs/BATON-INTEGRATION.md).
