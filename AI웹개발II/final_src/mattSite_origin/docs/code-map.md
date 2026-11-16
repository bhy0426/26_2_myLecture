# 코드 읽는 순서

현재 화면은 React, 서버는 Express다. `step5`는 Express 수업 예제로 참고했으며 원본은 수정하지 않았다.

## 1. React부터 읽기

처음에는 다음 다섯 파일만 순서대로 읽는다.

| 순서 | 파일                               | 확인할 내용                                         |
| ---- | ---------------------------------- | --------------------------------------------------- |
| 1    | `client/src/main.jsx`              | HTML의 `root`에 React 앱을 표시한다.                |
| 2    | `client/src/App.jsx`               | 주소마다 어떤 페이지 컴포넌트를 보여줄지 정한다.    |
| 3    | `client/src/pages/CoursesPage.jsx` | 강좌 목록·상세 화면을 JSX로 표시한다.               |
| 4    | `client/src/shared/hooks.js`       | `useResource`가 데이터를 조회하고 상태를 저장한다.  |
| 5    | `client/src/shared/api.js`         | `fetch`로 `/api/courses` 같은 서버 주소에 요청한다. |

HTML처럼 보이는 JSX 안의 `{courses.map(...)}`는 강좌 배열을 화면 요소로 바꾸는 JavaScript다. `useState`는 바뀌는 화면 값을 저장하고, `useEffect`는 데이터 조회 같은 작업을 수행한다.

## 2. 요청이 서버에서 처리되는 순서

| 순서 | 파일                            | 확인할 내용                                   |
| ---- | ------------------------------- | --------------------------------------------- |
| 6    | `src/server.js`                 | DB를 확인하고 서버를 켠다.                    |
| 7    | `src/app.js`                    | 공통 미들웨어와 기능별 API 라우터를 연결한다. |
| 8    | `src/modules/courses/routes.js` | 강좌 조회·등록·수정·삭제 요청을 처리한다.     |
| 9    | `src/database.js`               | SQL을 MySQL에 전달한다.                       |
| 10   | `database/schema.sql`           | 강좌·강의·회원 테이블의 구조를 정의한다.      |

```text
브라우저에서 /courses 열기
  → App.jsx가 CoursesPage를 선택
  → useResource('/courses')
  → api.js가 GET /api/courses 요청
  → app.js가 courses 라우터로 연결
  → routes.js가 database.js로 SQL 실행
  → JSON 응답
  → CoursesPage가 강좌 배열을 JSX로 표시
```

화면 주소 `/courses`와 API 주소 `/api/courses`는 역할이 다르다. React Router는 화면을 선택하고, Express Router는 서버 요청을 처리한다.

## 3. 공통 코드와 기능별 코드

```text
MathSite/
├─ client/                        React 프론트엔드
│  ├─ index.html                  root 하나를 가진 HTML
│  └─ src/
│     ├─ main.jsx                 React 실행 시작점
│     ├─ App.jsx                  화면 주소 목록
│     ├─ style.css                기본 서식
│     ├─ shared/
│     │  ├─ api.js                서버 통신
│     │  ├─ hooks.js              조회·저장 상태 관리
│     │  ├─ auth.jsx              로그인 상태·화면 접근 검사
│     │  └─ components.jsx        공통 메뉴·페이지 틀·입력 폼
│     └─ pages/
│        ├─ LoginPage.jsx         로그인·카카오 추가 가입
│        ├─ ProfilePage.jsx       내 정보
│        ├─ CoursesPage.jsx       강좌 목록·상세
│        ├─ LecturePage.jsx       영상 시청
│        ├─ BoardsPage.jsx        공지
│        ├─ InfoPage.jsx          소개·Q&A
│        └─ manager/              관리자
│           ├─ ManagerPage.jsx    관리 화면 조립
│           ├─ MemberManager.jsx 회원 승인·강의별 권한
│           ├─ CourseManager.jsx 강좌 관리
│           └─ LectureManager.jsx 영상 업로드·수정·삭제
├─ src/                           Express 백엔드
│  ├─ server.js                   서버 실행
│  ├─ app.js                      API 라우터 연결
│  ├─ frontend.js                 React 개발 서버·빌드 파일 제공
│  ├─ database.js                 DB 연결
│  ├─ middleware/                 세션·동일 출처 검사
│  ├─ shared/helpers.js           검증·암호화·권한 공통 함수
│  └─ modules/                    auth·user·manager·courses·boards·info
├─ database/                      SQL 스키마·공개 CA 인증서
├─ tests/                         Mocha 테스트
├─ scripts/                       DB 도구
├─ docs/                          설명
├─ vite.config.mjs                React 개발·빌드 설정
└─ package.json                   실행 명령과 라이브러리
```

강좌 화면은 `client/src/pages/CoursesPage.jsx`, 강좌 API는 `src/modules/courses/routes.js`에서 수정한다. 공지와 Q&A도 같은 이름의 페이지와 서버 모듈을 함께 읽으면 된다.

## 4. 다음으로 볼 코드

강좌 조회를 이해한 다음 `shared/auth.jsx`와 `src/middleware/session-user.js`로 로그인·권한 흐름을 읽는다. 이후 `LoginPage.jsx` → `src/modules/auth/routes.js` → `controller.js` 순서로 이메일 로그인을 확인한다. 카카오 파일은 `docs/kakao-setup.md`와 함께 나중에 읽어도 된다.

관리자는 `ManagerPage.jsx`에서 시작해 회원·강좌·강의 관리 컴포넌트로 이동한다. 화면에서 버튼을 숨기더라도 실제 수정·시청 권한은 Express에서 다시 검사한다.

## 5. 테스트와 설정 파일

`tests/api.test.js`는 일반 API와 React 화면 경로 12개 검사를, `tests/kakao.test.js`는 카카오 인증 7개 검사를 수행한다. Mocha의 `before`는 준비, `it`는 검사, `after`는 정리다.

`vite.config.mjs`, `src/frontend.js`, `package-lock.json`은 실행·빌드 연결을 위한 파일이다. 처음 기능을 공부할 때는 위 1~10번 흐름을 먼저 읽으면 된다. 생성물 `dist`, 설치 패키지 `node_modules`, 비공개 `.local`은 직접 편집할 소스가 아니다.
