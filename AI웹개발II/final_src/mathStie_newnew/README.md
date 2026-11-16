# MathSite

React + Express + Sequelize + MySQL로 만드는 학원 사이트. 관리자가 학생을 승인하고 **개별 강의의 시청 권한**을 부여한다. 강좌 안에 여러 강의가 있다.

## 코드를 처음 볼 때

1. [화면과 API 구조 지도](docs/code-map.md)에서 수정할 기능을 고른다. 화면은 `client/src`, 서버는 `src`에 있다.
2. [강좌 페이지](client/src/pages/courses/CoursesPage.jsx)에서 학생과 원장님이 같은 강좌를 여는 흐름을 본다. 원장님이 편집 모드를 켜면 강좌와 영상 편집 도구가 나타난다.
3. [관리자 화면](client/src/pages/manager/ManagerPage.jsx)에서 회원 관리, 가입·로그인 설정, 메일 관리 중 하나를 선택한다.
4. [API 목록](docs/API.md)과 [파일·함수 안내](docs/functions.md)에서 해당 요청의 서버 코드와 Mocha 테스트를 찾는다.

하연이가 영상 모듈을 연결할 곳은 [영상 입력 폼](client/src/pages/courses/LectureEditor.jsx)과 [재생 컴포넌트](client/src/pages/courses/VideoPlayer.jsx)다. 서버는 [강의 라우터](src/modules/courses/lectures.routes.js)에서 요청을 받아 강좌 소속과 시청 권한을 검사한다.

## 회원과 발신 메일

- **회원 관리**에서 학생을 선택해 가입을 승인하거나 정지하고 회원 정보·역할·강의별 시청 기간을 수정한다.
- **가입·로그인 설정**에서 아이디·닉네임·이메일의 사용 여부를 저장한다. 회원가입은 켜 둔 항목마다 중복을 확인한다. 이메일이 켜져 있으면 메일 인증, 꺼져 있으면 설정된 카카오·구글 계정을 사용한다.
- **메일 관리**에서 Gmail 또는 네이버 발신 주소를 입력하고 새 주소로 받은 코드로 등록한다. 기존 서버 기본 발신자는 첫 교체 전까지 사용된다. [초기·이전 설정](docs/HANDOFF.md)

[인수인계서](docs/HANDOFF.md) · [기말 평가 항목](docs/requirements-status.md) · [카카오·구글 설정](docs/social-login.md)

## 실행

Node.js 22.12 이상. `.env.example`을 `.env`로 복사하고 본인의 DB·세션 설정을 입력한다. DB 자체와 접속 계정은 먼저 준비해야 한다.

```powershell
npm.cmd ci
npm.cmd run db:init
npm.cmd run dev
```

기본 주소는 `http://127.0.0.1:3000/`. `npm.cmd start`는 React를 빌드한 뒤 실행한다. 서버 시작 때 필요한 테이블을 확인·준비한다. 중복 회원을 삭제하거나 자동으로 이름을 바꾸는 초기화 코드는 없다.

## 검사

이 PC의 전용 MySQL과 `.env.local`, FFmpeg·Nginx를 준비한 뒤 실행한다.

```powershell
npm.cmd run db:start
npm.cmd test
npm.cmd run format:check
```

Mocha 통합 테스트에는 회원 중복 확인과 관리자 발신 계정 교체 검사도 포함된다. 테스트는 localhost의 `mathsite_test` 자료만 재생성하며 가입 코드는 테스트 편지함에서 확인한다.

## 공유

공백 4칸, `npm run format` 사용. `.env`, `.env.local`, `.local`, 영상·백업, `node_modules`, `dist`는 Git·공유 ZIP에서 제외한다. 새 PC의 연결 설정과 도구 준비는 [인수인계서](docs/HANDOFF.md)에 있다.
