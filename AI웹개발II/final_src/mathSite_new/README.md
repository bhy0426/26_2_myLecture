# MathSite

React + Express + MySQL 기반 학원 사이트. 관리자가 회원을 승인하고 학생별 강의 시청 권한을 부여한다. 카카오·아이디·이메일 로그인, 강좌·영상 관리, FFmpeg HLS 변환·Nginx 제공, 공지·팝업·Q&A를 구현했다.

**처음 받은 팀원은 [인수인계서](docs/HANDOFF.md)부터 읽는다.**

- [구조 지도](docs/architecture.md): 화면·API·DB·폴더 연결
- [코드 읽는 순서](docs/code-map.md): 강좌 조회 흐름
- [파일·함수 안내서](docs/functions.md): 각 파일과 함수 설명
- [API 목록](docs/API.md): 주소·입력·권한
- [기획 반영 상태](docs/requirements-status.md): 구현과 외부 연결 상태
- [카카오 설정](docs/kakao-setup.md)

## 실행

Node.js 22.12 이상. `.env.example`을 `.env`로 복사한 뒤 팀의 비공개 DB·카카오 설정과 본인의 세션 비밀값을 입력한다.

```powershell
npm.cmd ci
npm.cmd run db:init
npm.cmd run dev
```

사이트: **http://127.0.0.1:3000/**. `client/src`는 브라우저의 React, 루트 `src`는 Node.js의 Express다. 화면 주소는 `/courses`, 데이터 요청 주소는 `/api/courses`처럼 구분한다.

`npm.cmd start`는 React를 빌드한 뒤 서버를 실행한다. 서버를 재시작하면 메모리 세션이 사라져 다시 로그인해야 한다.

## 영상 서버

FFmpeg·Nginx 실행 파일 경로를 `.env`에 입력한다. 준비 방법과 이 PC의 설치 위치는 인수인계서에 있다.

```powershell
npm.cmd run media:check
npm.cmd run media:start
```

Nginx 경유 사이트: **http://127.0.0.1:8080/**. 중지는 `npm.cmd run media:stop`.

영상은 서버의 원본·HLS 폴더에 저장하며 MySQL에는 경로 식별자와 권한을 저장한다. 모든 HLS 요청은 Express의 권한 검사를 거친다. 온라인 DB를 공유해도 각 PC의 영상 파일은 자동 공유되지 않는다.

## DB·외부 연결

현재 개발 DB는 이전 합의에 따라 Neon 대신 Filess.io 공유 MySQL을 사용한다. TLS·호스트 이름 검증을 사용하고 팀별 연결 제한 때문에 PC당 `DB_CONNECTION_LIMIT=1`을 사용한다. 공개 CA는 `database/certs/filess-ca.pem`이다.

`db:init`은 기존 자료를 유지하면서 필요한 테이블·열을 추가한다. 기존 회원의 아이디가 비어 있어도 이메일 로그인은 가능하다. 신규 일반 가입 화면은 아이디를 함께 받는다.

사용자가 SMTP 계정과 카카오톡 채널은 아직 없다고 확인했다. **SMTP 발송 코드·재설정 화면·채널 주소 설정·상담 링크는 구현했지만 실제 외부 계정 연결은 남아 있다.** SMTP 미설정 시 메일이 발송됐다고 처리하지 않는다.

## 검사

로컬 전용 MySQL과 `.env.local`, FFmpeg·Nginx를 준비한 후 실행한다.

```powershell
npm.cmd run db:start
npm.cmd test
npm.cmd run format:check
```

Mocha 28개 검사: 일반 API 12, 카카오 7, 추가 기능·실제 FFmpeg·Nginx 9개. 테스트는 localhost의 `mathsite_test` 합성 자료만 사용하며 그 자료를 재생성한다. 공유 개발 DB는 테스트 초기화 대상으로 사용하지 않는다.

회원 관리 외 Router는 courses 6개, lectures 8개, boards 7개, info의 Q&A 8개·설정 2개 API다. lectures는 강좌 하위에 연결한 별도 Router이므로 평가상 별도 라우터 인정 여부는 교수 기준을 확인한다.

## 공유

공백 4칸, `npm run format` 사용. `.env`·`.env.local`·`.local`·원본 영상·DB 백업·node_modules·dist는 Git·소스 공유 ZIP에서 제외한다. 도구 실행 파일은 새 PC에서 별도로 준비한다.

현재 변경은 로컬 검토용이며 **아직 커밋·푸시하지 않았다.** 외부 공개 배포, 실제 SMTP 수신 확인, 보고서 PDF·대면 회의 사진·제출은 별도 작업이다.
