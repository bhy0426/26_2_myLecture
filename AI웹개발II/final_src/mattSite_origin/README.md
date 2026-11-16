# MathSite

React + Express + MySQL 기반 학원 사이트. 카카오·이메일 로그인, 관리자 승인, 강좌·강의 영상, 학생별 시청 권한, 공지와 Q&A를 제공한다.

**처음 공부할 때는 [코드 읽는 순서](docs/code-map.md)를 먼저 본다.**

## 실행

Node.js 22.12 이상이 필요하다. `.env.example`을 `.env`로 복사하고 팀에서 전달받은 DB·카카오 연결 정보와 본인 PC의 `SESSION_SECRET`을 입력한다.

```powershell
npm.cmd ci
npm.cmd run dev
```

브라우저에서 **http://127.0.0.1:3000/** 를 연다. React와 Express가 같은 주소에서 동작하며, React 파일을 저장하면 화면에 반영된다. 서버의 `src` 파일을 수정하면 서버가 재시작되므로 다시 로그인해야 할 수 있다.

일반 실행은 아래 명령을 사용한다. React를 먼저 빌드하고 서버를 실행한다.

```powershell
npm.cmd start
```

빌드만 할 때는 `npm run build`를 사용한다. 생성된 `dist/client`는 수정하거나 Git에 올리지 않는다.

## 코드 구조

| 위치                  | 역할                         |
| --------------------- | ---------------------------- |
| `client/src/App.jsx`  | React 화면 주소              |
| `client/src/pages`    | 화면별 React 컴포넌트        |
| `client/src/shared`   | 메뉴·폼·로그인 상태·API 호출 |
| `src/app.js`          | Express API 연결             |
| `src/modules`         | 기능별 백엔드 라우터         |
| `database/schema.sql` | DB 테이블 구조               |
| `tests`               | Mocha 통합 테스트            |

화면별 HTML·DOM 조작 코드를 React로 옮겼다. 기본 HTML/CSS 수준의 화면을 유지하며 화면 틀·메뉴·입력 폼을 공통 컴포넌트로 사용한다. 관리자 화면은 회원·강좌·강의 관리로 나눴다. 백엔드의 인증·SQL·권한 라우터는 유지한다.

## 화면과 API

화면은 `/`, `/login`, `/user`, `/info`, `/courses`, `/courses/:courseId`, `/courses/:courseId/lectures/:lectureId`, `/boards`, `/manager`다. 직접 주소로 열거나 새로고침해도 같은 React 화면을 제공한다.

JSON API는 `/api/auth`, `/api/user`, `/api/manager`, `/api/info`, `/api/courses`, `/api/courses/:courseId/lectures`, `/api/boards`다. 카카오 인증 시작·복귀 주소 `/auth/kakao`, `/auth/kakao/callback`은 유지한다. 상태 API는 `/health`다.

평가 대상은 info 8개, courses 6개, lectures 6개, boards 6개다. 인증·회원 관리 라우터는 별도로 둔다.

## 로그인·권한

- 신규 카카오 회원은 이름·이메일을 입력한 뒤 관리자 승인을 기다린다.
- 기존 이메일 회원은 로그인 후 내 정보 화면에서 카카오 계정을 연결한다.
- 관리자가 회원 승인과 강의별 시청 권한을 각각 부여한다.
- 학생은 허용된 강의를 시청하며, 관리자만 강좌·강의를 관리한다.
- React의 메뉴·화면 검사와 별도로 Express가 매 요청의 회원 상태와 권한을 검사한다.

[카카오 연결 설정](docs/kakao-setup.md)을 참고한다. 같은 프로젝트의 카카오 앱을 사용하고, 로그인 주소는 `localhost` 대신 `127.0.0.1`로 통일한다.

## DB와 영상

개발 DB는 Filess.io의 무료 공유형 MySQL 5.7이다. `.env`에 팀의 연결 정보를 입력하면 되며 사이트 실행만 할 때는 로컬 MySQL이 필요하지 않다. DB당 10MB, 동시 연결 수 제한 5개에 맞춰 각 PC의 `DB_CONNECTION_LIMIT=1`을 사용한다.

`DB_SSL=true`, `DB_SSL_CA=database/certs/filess-ca.pem`을 사용한다. 2026-11-14 제공업체 서버가 Let's Encrypt 인증서로 변경되어, CA 파일을 Node.js 신뢰 저장소의 ISRG Root X1 공개 인증서로 갱신했다. 인증서와 호스트 이름을 모두 검증한다. 이 인증서는 비밀번호나 개인키가 아니다.

영상은 각 PC의 `.local/uploads`에 저장한다. DB를 공유해도 영상 파일은 자동 공유되지 않으므로 같은 영상을 보려면 파일도 같은 경로에 복사해야 한다. 영상 저장소의 온라인 전환은 별도 작업이다.

`npm run db:init`은 빈 DB를 처음 준비할 때 사용한다. 새 DB의 최초 관리자 생성은 `.env`의 `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`로 설정한다. 기존 DB와 사용자 데이터를 초기화하지 않는다.

## 테스트

Mocha로 API·권한·카카오 인증·React 파일 제공을 검사한다.

```powershell
npm.cmd test
```

React 빌드 후 일반 API 12개와 카카오 인증 7개, 총 **19개**를 실행한다. DB·환경 설정이 섞이지 않도록 두 테스트 파일을 별도 프로세스에서 순서대로 실행한다. 카카오 공급자 응답만 대체하고 HTTP·SQL은 실제로 실행한다.

테스트는 `.env.local`에 지정한 **로컬 MySQL의 `mathsite_test`**만 사용한다. 공유 개발 DB는 테스트로 초기화하지 않는다. 새 PC에서는 로컬 시험용 DB·접근 계정을 준비하고 `.env.local`에 연결 정보를 입력한다. DB 주소는 `127.0.0.1` 또는 `localhost`만 허용한다. 이 PC의 전용 로컬 DB 도구는 `npm run db:start`, `npm run db:stop`이다.

## 공유와 편집

`.env`, `.env.local`, `.local`, `node_modules`, `dist`, 실제 DB 데이터·영상·인증키는 Git에 올리지 않는다. 서버 키에는 `VITE_` 접두사를 붙이지 않으며, Vite는 서버 `.env`를 읽지 않도록 설정했다.

공백 4칸으로 정렬한다. `npm run format`으로 정렬하고 `npm run format:check`로 검사한다. 개발 중 상세 파일은 [코드 안내](docs/code-map.md)에서 확인한다.

로그인 세션은 메모리 저장이므로 서버 재시작 시 다시 로그인한다. 실제 이메일 발송, 외부 영상 저장소, 카카오 채널, 모듈 ON/OFF 기능은 아직 연결하지 않았다.
