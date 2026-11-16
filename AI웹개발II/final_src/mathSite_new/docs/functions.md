# 파일·함수 안내서

현재 구현 기준: 2026-11-14. 먼저 [인수인계서](HANDOFF.md)와 [구조 지도](architecture.md)를 읽는다. 아래 설명은 현재 파일의 이름 있는 함수·HTTP 처리 함수·주요 미들웨어·Mocha 검사를 포함한다. map/then/클릭·제출 콜백은 해당 컴포넌트의 처리 흐름에 포함해서 읽는다.

함수는 입력 → 처리 → 반환/응답 순으로 읽는다. req는 요청, res는 응답, next는 다음 서버 처리다. React 컴포넌트는 화면 JSX를 반환하고 async 함수는 Promise를 반환한다.

## 파일 찾아보기

- [.editorconfig](#file-1) — 편집기 공통 들여쓰기 규칙
- [.env.example](#file-2) — 비공개 설정에 어떤 항목이 필요한지 보여주는 양식
- [.gitattributes](#file-3) — Git의 텍스트 줄바꿈 규칙
- [.gitignore](#file-4) — Git에 올리지 않을 파일 지정
- [.prettierignore](#file-5) — Prettier가 정렬하지 않을 파일
- [.prettierrc.json](#file-6) — Prettier 코드 정렬 규칙
- [.vscode/settings.json](#file-7) — VS Code의 들여쓰기·표시 기본값
- [README.md](#file-8) — 실행·설정·테스트 기본 안내
- [client/index.html](#file-9) — React가 들어갈 빈 HTML 틀
- [client/src/App.jsx](#file-10) — 화면 주소와 페이지를 연결
- [client/src/main.jsx](#file-11) — React 화면의 실행 시작점
- [client/src/pages/BoardsPage.jsx](#file-12) — 공지 목록·본문·관리자 작성 화면
- [client/src/pages/CoursesPage.jsx](#file-13) — 강좌·강의 제목 검색과 목록/상세
- [client/src/pages/InfoPage.jsx](#file-14) — 학원 소개와 질문·답변 화면
- [client/src/pages/LecturePage.jsx](#file-15) — 시청 권한 요청과 영상 정보 표시
- [client/src/pages/LoginPage.jsx](#file-16) — 카카오와 아이디·이메일 로그인
- [client/src/pages/ProfilePage.jsx](#file-17) — 이름·이메일·아이디 설정·카카오 연결
- [client/src/pages/RegisterPage.jsx](#file-18) — 일반 가입 폼·아이디/이름/이메일/비밀번호 입력
- [client/src/pages/ResetPage.jsx](#file-19) — 재설정 메일 요청과 토큰으로 새 비밀번호 입력
- [client/src/pages/manager/CourseManager.jsx](#file-20) — 강좌 선택·생성·수정·삭제·공개 여부
- [client/src/pages/manager/LectureManager.jsx](#file-21) — 강의 업로드·편집·공개 상태·변환 재시도
- [client/src/pages/manager/ManagerPage.jsx](#file-22) — 회원·역할·설정·강좌·강의 관리 화면 조립
- [client/src/pages/manager/MemberManager.jsx](#file-23) — 회원 상세·승인·역할·삭제와 시청 권한 UI
- [client/src/pages/manager/RoleManager.jsx](#file-24) — 역할 목록·생성·이름 수정·삭제 UI
- [client/src/pages/manager/SiteSettings.jsx](#file-25) — 카카오 채널 주소 설정·SMTP 준비 여부 표시
- [client/src/shared/PopupNotice.jsx](#file-26) — 로그인 사용자에게 공지 dialog 표시·오늘 숨김
- [client/src/shared/VideoPlayer.jsx](#file-27) — 원본·HLS를 지원하는 공통 영상 플레이어
- [client/src/shared/api.js](#file-28) — 브라우저에서 서버에 요청하는 공통 함수
- [client/src/shared/auth.jsx](#file-29) — React 전체의 로그인 상태와 화면 접근 검사
- [client/src/shared/components.jsx](#file-30) — 공통 메뉴·폼·로그아웃·팝업 조립
- [client/src/shared/hooks.js](#file-31) — 조회·저장 중 화면 상태를 재사용
- [client/src/style.css](#file-32) — 기본 메뉴·입력 폼·영상 크기 서식
- [database/certs/filess-ca.pem](#file-33) — 온라인 MySQL TLS 검증용 공개 CA 인증서
- [database/migrate.js](#file-34) — 기존 자료를 유지하면서 새 열·설정 행 준비
- [database/schema.sql](#file-35) — MySQL 테이블과 연결 관계 정의
- [docs/API.md](#file-36) — 설명 문서
- [docs/HANDOFF.md](#file-37) — 설명 문서
- [docs/architecture.md](#file-38) — 설명 문서
- [docs/code-map.md](#file-39) — 폴더 구조와 코드 읽는 순서
- [docs/functions.md](#file-40) — 현재 파일·함수 설명 전체 목록
- [docs/kakao-setup.md](#file-41) — 카카오 개발자 앱과 로컬 설정 방법
- [docs/requirements-status.md](#file-42) — 설명 문서
- [package-lock.json](#file-43) — 설치할 라이브러리 버전 고정
- [package.json](#file-44) — 프로젝트 실행 명령·라이브러리 목록
- [scripts/init-db.js](#file-45) — 스키마·마이그레이션·최초 관리자 준비
- [scripts/local-db.js](#file-46) — 이 PC의 MathSite 전용 테스트 MySQL 시작·중지
- [scripts/nginx.js](#file-47) — 전용 Nginx 설정 생성·검사·시작·중지
- [server/nginx.conf.template](#file-48) — 설정·자료 파일
- [src/app.js](#file-49) — Express 앱과 공통 처리 순서·API 라우터 연결
- [src/database.js](#file-50) — MySQL 연결 풀과 SQL 실행 공통 함수
- [src/frontend.js](#file-51) — Express에서 React 실행·빌드 결과를 제공
- [src/middleware/session-user.js](#file-52) — 세션을 사용자 정보로 바꾸고 요청 출처 확인
- [src/modules/auth/controller.js](#file-53) — 아이디·이메일 인증·가입·재설정
- [src/modules/auth/kakao.client.js](#file-54) — 카카오 서버와 HTTP 통신
- [src/modules/auth/kakao.config.js](#file-55) — 카카오 설정 읽기·검사
- [src/modules/auth/kakao.controller.js](#file-56) — 카카오 로그인 전체 흐름 제어
- [src/modules/auth/kakao.repository.js](#file-57) — 우리 회원과 카카오 계정 연결 정보를 DB에 저장
- [src/modules/auth/kakao.routes.js](#file-58) — 카카오 인증 URL과 controller 연결
- [src/modules/auth/mail.js](#file-59) — SMTP와 로컬 시험 메일 전달을 분리
- [src/modules/auth/routes.js](#file-60) — 이메일 인증 주소와 controller 함수 연결
- [src/modules/auth/session.js](#file-61) — 이메일·카카오가 공유하는 로그인 세션 처리
- [src/modules/boards/routes.js](#file-62) — 공지 CRUD·고정·팝업
- [src/modules/courses/lectures.routes.js](#file-63) — 강좌 하위 영상 업로드·변환·보호된 원본/HLS 재생
- [src/modules/courses/routes.js](#file-64) — 강좌 CRUD·검색과 하위 강의 연결
- [src/modules/courses/video.js](#file-65) — FFmpeg HLS 순차 변환·취소·복구
- [src/modules/info/routes.js](#file-66) — 공개 설정 하위 라우터와 로그인 Q&A
- [src/modules/info/settings.routes.js](#file-67) — 공개 채널 주소 조회·관리자 설정
- [src/modules/manager/routes.js](#file-68) — 관리자 전용 회원·역할·시청 권한 관리 API
- [src/modules/user/routes.js](#file-69) — 본인 이름·이메일·아이디 수정
- [src/server.js](#file-70) — DB 확인·React 연결·변환 복구 후 HTTP 서버 시작
- [src/shared/helpers.js](#file-71) — 입력·비밀번호·회원·시청 권한·파일 공통 함수
- [tests/api.test.js](#file-72) — Mocha로 API와 권한의 실제 동작 검사
- [tests/database-env.js](#file-73) — 테스트가 공유 온라인 DB를 건드리지 못하게 설정
- [tests/features.test.js](#file-74) — 추가 기능과 실제 FFmpeg·Nginx 통합 검사
- [tests/fixtures/sample.mp4](#file-75) — 업로드·부분 재생 검사에 쓰는 짧은 영상
- [tests/http-client.js](#file-76) — Mocha 테스트용 HTTP 요청 함수 생성
- [tests/kakao.test.js](#file-77) — Mocha로 카카오 인증 흐름 검사
- [tests/seed.js](#file-78) — 테스트 전용 회원·강좌·영상·권한 자료 준비
- [vite.config.mjs](#file-79) — React 개발·빌드 설정

<a id="file-1"></a>

## .editorconfig

역할: 편집기 공통 들여쓰기 규칙

[실제 파일](../.editorconfig)

이름 있는 사용자 함수는 없다. 시작 구문·화면 틀·테이블·설정·자료 또는 문서다. 해당 역할과 연결은 인수인계서의 수정 파일 표를 참고한다.

<a id="file-2"></a>

## .env.example

역할: 비공개 설정에 어떤 항목이 필요한지 보여주는 양식

[실제 파일](../.env.example)

이름 있는 사용자 함수는 없다. 시작 구문·화면 틀·테이블·설정·자료 또는 문서다. 해당 역할과 연결은 인수인계서의 수정 파일 표를 참고한다.

<a id="file-3"></a>

## .gitattributes

역할: Git의 텍스트 줄바꿈 규칙

[실제 파일](../.gitattributes)

이름 있는 사용자 함수는 없다. 시작 구문·화면 틀·테이블·설정·자료 또는 문서다. 해당 역할과 연결은 인수인계서의 수정 파일 표를 참고한다.

<a id="file-4"></a>

## .gitignore

역할: Git에 올리지 않을 파일 지정

[실제 파일](../.gitignore)

이름 있는 사용자 함수는 없다. 시작 구문·화면 틀·테이블·설정·자료 또는 문서다. 해당 역할과 연결은 인수인계서의 수정 파일 표를 참고한다.

<a id="file-5"></a>

## .prettierignore

역할: Prettier가 정렬하지 않을 파일

[실제 파일](../.prettierignore)

이름 있는 사용자 함수는 없다. 시작 구문·화면 틀·테이블·설정·자료 또는 문서다. 해당 역할과 연결은 인수인계서의 수정 파일 표를 참고한다.

<a id="file-6"></a>

## .prettierrc.json

역할: Prettier 코드 정렬 규칙

[실제 파일](../.prettierrc.json)

이름 있는 사용자 함수는 없다. 시작 구문·화면 틀·테이블·설정·자료 또는 문서다. 해당 역할과 연결은 인수인계서의 수정 파일 표를 참고한다.

<a id="file-7"></a>

## .vscode/settings.json

역할: VS Code의 들여쓰기·표시 기본값

[실제 파일](../.vscode/settings.json)

이름 있는 사용자 함수는 없다. 시작 구문·화면 틀·테이블·설정·자료 또는 문서다. 해당 역할과 연결은 인수인계서의 수정 파일 표를 참고한다.

<a id="file-8"></a>

## README.md

역할: 실행·설정·테스트 기본 안내

[실제 파일](../README.md)

이름 있는 사용자 함수는 없다. 시작 구문·화면 틀·테이블·설정·자료 또는 문서다. 해당 역할과 연결은 인수인계서의 수정 파일 표를 참고한다.

<a id="file-9"></a>

## client/index.html

역할: React가 들어갈 빈 HTML 틀

[실제 파일](../client/index.html)

이름 있는 사용자 함수는 없다. 시작 구문·화면 틀·테이블·설정·자료 또는 문서다. 해당 역할과 연결은 인수인계서의 수정 파일 표를 참고한다.

<a id="file-10"></a>

## client/src/App.jsx

역할: 화면 주소와 페이지를 연결

[실제 파일](../client/src/App.jsx)

### App

원본 14행.

입력 없음 → Layout 안에 Routes를 배치하고 path에 맞는 페이지 컴포넌트를 선택 → 화면(JSX)을 반환한다. /manager는 RequireUser admin으로 감싼다.

<a id="file-11"></a>

## client/src/main.jsx

역할: React 화면의 실행 시작점

[실제 파일](../client/src/main.jsx)

이름 있는 사용자 함수는 없다. 시작 구문·화면 틀·테이블·설정·자료 또는 문서다. 해당 역할과 연결은 인수인계서의 수정 파일 표를 참고한다.

<a id="file-12"></a>

## client/src/pages/BoardsPage.jsx

역할: 공지 목록·본문·관리자 작성 화면

[실제 파일](../client/src/pages/BoardsPage.jsx)

### BoardsPage

원본 7행.

로그인한 user와 선택한 공지 ID를 사용 → useResource로 목록·상세 조회 → 공지 화면 반환. 저장 콜백은 선택 여부에 따라 POST/PATCH, 삭제 콜백은 DELETE /api/boards/:boardId를 호출한다.

### reset

원본 15행.

입력 없음 → 선택 ID를 비우고 draftKey를 증가시켜 새 입력 폼으로 교체, list.reload() 호출 → 새 공지 작성 상태로 돌아간다.

<a id="file-13"></a>

## client/src/pages/CoursesPage.jsx

역할: 강좌·강의 제목 검색과 목록/상세

[실제 파일](../client/src/pages/CoursesPage.jsx)

### CoursesPage

원본 6행.

주소의 courseId로 강좌 목록/상세를 구분한다. 검색어를 강좌 또는 하위 강의 GET의 q에 넣고 useResource 결과를 링크 목록으로 그린다.

<a id="file-14"></a>

## client/src/pages/InfoPage.jsx

역할: 학원 소개와 질문·답변 화면

[실제 파일](../client/src/pages/InfoPage.jsx)

### InfoPage

원본 8행.

로그인 user를 읽는다 → 소개 문구와 로그인 여부에 따른 Questions/로그인 안내 → 화면을 반환한다.

### Questions

원본 33행.

user를 받는다 → 질문 목록·선택 질문을 조회 → 질문 작성·작성자 수정·삭제 및 관리자 답변 폼을 반환한다. 질문 저장은 POST/PATCH /api/info/qna, 답변 저장은 POST/PATCH .../answer, 삭제는 DELETE를 호출한다.

### reset

원본 41행.

입력 없음 → 선택 해제, draftKey 증가, 질문 목록 재조회 → 새 질문 폼으로 바꾼다. BoardsPage의 reset과 이름만 같고 서로 다른 함수다.

<a id="file-15"></a>

## client/src/pages/LecturePage.jsx

역할: 시청 권한 요청과 영상 정보 표시

[실제 파일](../client/src/pages/LecturePage.jsx)

### LecturePage

원본 7행.

courseId·lectureId로 playback API를 요청하고 응답의 format·playbackUrl을 VideoPlayer에 전달한다. 화면 전환 시 이전 응답은 무시한다.

<a id="file-16"></a>

## client/src/pages/LoginPage.jsx

역할: 카카오와 아이디·이메일 로그인

[실제 파일](../client/src/pages/LoginPage.jsx)

### LoginPage

원본 8행.

아이디 또는 이메일과 비밀번호를 로그인 API로 전송한다. 일반 가입·재설정 링크와 최초 카카오 인증 후 이름/이메일 폼을 제공한다. 로그인 성공 시 user 상태를 갱신한다.

<a id="file-17"></a>

## client/src/pages/ProfilePage.jsx

역할: 이름·이메일·아이디 설정·카카오 연결

[실제 파일](../client/src/pages/ProfilePage.jsx)

### ProfilePage

원본 6행.

user를 읽어 정보 폼을 그리고 PATCH /api/user 성공 시 Context를 갱신한다. 기존 username이 없는 회원도 자기 아이디를 등록할 수 있다.

<a id="file-18"></a>

## client/src/pages/RegisterPage.jsx

역할: 일반 가입 폼·아이디/이름/이메일/비밀번호 입력

[실제 파일](../client/src/pages/RegisterPage.jsx)

### RegisterPage

원본 6행.

폼 제출 시 비밀번호 확인을 비교하고 POST /api/auth/register를 보낸다. 성공하면 입력을 비우고 관리자 승인 대기를 안내한다.

<a id="file-19"></a>

## client/src/pages/ResetPage.jsx

역할: 재설정 메일 요청과 토큰으로 새 비밀번호 입력

[실제 파일](../client/src/pages/ResetPage.jsx)

### ResetPage

원본 7행.

주소의 token 유무로 이메일 요청/새 비밀번호 입력을 구분한다. POST /api/auth/reset 후 완료 상태로 바꾸고 사용한 토큰을 주소에서 제거한다.

<a id="file-20"></a>

## client/src/pages/manager/CourseManager.jsx

역할: 강좌 선택·생성·수정·삭제·공개 여부

[실제 파일](../client/src/pages/manager/CourseManager.jsx)

### CourseManager

원본 5행.

강좌 입력과 공개 체크박스를 그리고 클릭한 create/update 버튼에 따라 POST/PATCH 요청을 보낸다. 삭제 후 선택과 상위 목록을 갱신한다.

<a id="file-21"></a>

## client/src/pages/manager/LectureManager.jsx

역할: 강의 업로드·편집·공개 상태·변환 재시도

[실제 파일](../client/src/pages/manager/LectureManager.jsx)

### LectureManager

원본 6행.

강의마다 원본/변환 중/HLS 준비/실패 상태와 수정·삭제·변환 재시도 버튼을 그린다. 새 강의는 파일을 포함한 FormData로 등록한다.

### save

원본 9행.

폼·폼 요소·수정 강의를 받는다. 빈 파일은 제거하고 isPublished를 명시해 POST/PATCH 전송한다. 새 등록은 폼을 초기화하고 상위 목록을 갱신한다.

### LectureFields

원본 93행.

강의명·설명·순서·파일·공개 여부 입력을 반환한다. 새 등록은 파일 필수, 수정은 선택이다.

<a id="file-22"></a>

## client/src/pages/manager/ManagerPage.jsx

역할: 회원·역할·설정·강좌·강의 관리 화면 조립

[실제 파일](../client/src/pages/manager/ManagerPage.jsx)

### ManagerPage

원본 10행.

회원·역할·강좌·선택 강의 목록을 읽어 하위 관리 컴포넌트에 전달한다. PROCESSING 강의가 있으면 3초마다 재조회하고 화면을 떠나면 타이머를 정리한다.

<a id="file-23"></a>

## client/src/pages/manager/MemberManager.jsx

역할: 회원 상세·승인·역할·삭제와 시청 권한 UI

[실제 파일](../client/src/pages/manager/MemberManager.jsx)

### MemberManager

원본 8행.

회원·역할·강의 목록을 받아 선택 회원의 정보·역할 변경·삭제 폼과 학생별 강의 권한 폼을 그린다. 현재 관리자 본인 변경 버튼은 비활성화한다.

### changeStatus

원본 21행.

status를 받는다 → PATCH /api/manager/users/:id/status → 성공하면 onChange()로 회원 목록을 재조회하고 결과를 반환한다.

### access

원본 28행.

grant·대상 강의·선택 만료일을 받아 허용/회수 API를 호출하고 학생의 현재 권한 목록을 재조회한다.

<a id="file-24"></a>

## client/src/pages/manager/RoleManager.jsx

역할: 역할 목록·생성·이름 수정·삭제 UI

[실제 파일](../client/src/pages/manager/RoleManager.jsx)

### RoleManager

원본 5행.

roles·onChange를 받아 역할별 수정 폼과 새 역할 폼을 그린다. admin/student 삭제 버튼은 제공하지 않는다.

### save

원본 7행.

method·body를 받아 /api/manager에 POST/PATCH/DELETE를 요청한다. 완료되면 상위 역할·회원 목록을 재조회한다.

<a id="file-25"></a>

## client/src/pages/manager/SiteSettings.jsx

역할: 카카오 채널 주소 설정·SMTP 준비 여부 표시

[실제 파일](../client/src/pages/manager/SiteSettings.jsx)

### SiteSettings

원본 5행.

GET /api/info/settings로 설정을 읽고 관리자 폼에서 PATCH로 채널 주소를 저장한다. SMTP는 실제 인증값 대신 설정 유무만 표시한다.

<a id="file-26"></a>

## client/src/shared/PopupNotice.jsx

역할: 로그인 사용자에게 공지 dialog 표시·오늘 숨김

[실제 파일](../client/src/shared/PopupNotice.jsx)

### PopupNotice

원본 4행.

GET /api/boards/popup으로 최신 팝업 공지를 조회한다. 오늘 숨김 기록이 없으면 showModal()로 표시한다. 저장소 사용 불가 시에도 닫기는 가능하다.

### close

원본 21행.

today 여부를 받는다. 오늘 숨김이면 공지 ID·날짜를 localStorage에 저장하고 dialog를 닫은 뒤 closed 상태를 true로 바꾼다.

<a id="file-27"></a>

## client/src/shared/VideoPlayer.jsx

역할: 원본·HLS를 지원하는 공통 영상 플레이어

[실제 파일](../client/src/shared/VideoPlayer.jsx)

### VideoPlayer

원본 4행.

src·format·onError를 받는다. 원본/브라우저 기본 HLS 또는 HLS.js를 선택해 video에 연결한다. 치명적 오류는 로딩 중단과 오류 문구로 처리하고 화면을 떠나면 player.destroy()로 정리한다.

<a id="file-28"></a>

## client/src/shared/api.js

역할: 브라우저에서 서버에 요청하는 공통 함수

[실제 파일](../client/src/shared/api.js)

### api

원본 2행.

method(요청 방식), path(API 주소), body(보낼 값)를 받는다 → fetch로 요청하고 응답을 JSON으로 읽는다 → 성공하면 응답 객체를 반환하고 실패하면 Error를 던진다. FormData는 파일을 포함하므로 JSON으로 바꾸지 않는다.

<a id="file-29"></a>

## client/src/shared/auth.jsx

역할: React 전체의 로그인 상태와 화면 접근 검사

[실제 파일](../client/src/shared/auth.jsx)

### useAuth

원본 6행.

입력 없음 → useContext(AuthContext) → 현재 user, setUser, loading, error를 가져온다.

### AuthProvider

원본 8행.

children(안에 넣은 화면)을 받는다 → 처음에 GET /api/auth/status로 사용자 조회 → 로그인 상태를 Context로 공유하면서 children을 반환한다.

### RequireUser

원본 26행.

admin(기본 false), children을 받는다 → 조회 중/오류/비로그인/관리자 여부를 확인 → 허용하면 children, 비로그인이면 로그인 화면 이동, 일반 계정의 관리자 접근이면 안내 문구를 반환한다.

<a id="file-30"></a>

## client/src/shared/components.jsx

역할: 공통 메뉴·폼·로그아웃·팝업 조립

[실제 파일](../client/src/shared/components.jsx)

### Layout

원본 8행.

children 앞에 공통 메뉴를 그리고 로그인 사용자는 PopupNotice를 붙인다. 관리자 메뉴는 canManage일 때 표시하며 로그아웃은 API 완료 후 상태를 비우고 홈으로 이동한다.

### Page

원본 52행.

title, message, children을 받는다 → useEffect로 브라우저 탭 제목을 변경 → 페이지 제목·처리 결과 문구·본문을 반환한다.

### Field

원본 65행.

label, as, 나머지 입력 속성을 받는다 → label과 input/select/textarea를 조립 → 재사용 입력 항목을 반환한다. as를 Control이라는 이름으로 받아 기본값 input을 사용한다.

### Form

원본 74행.

onSubmit, busy, children 등을 받는다 → 제출 콜백에서 preventDefault()로 새로고침을 막고 FormData와 form 요소를 onSubmit에 전달 → 입력 폼을 반환한다. busy일 때 fieldset을 비활성화한다.

### DeleteButton

원본 89행.

onDelete, children, disabled를 받는다 → 첫 클릭은 armed=true로 확인 문구를 표시, 두 번째 클릭은 await onDelete() → 삭제 확인 버튼을 반환한다.

<a id="file-31"></a>

## client/src/shared/hooks.js

역할: 조회·저장 중 화면 상태를 재사용

[실제 파일](../client/src/shared/hooks.js)

### useResource

원본 5행.

url을 받는다 → useEffect 안에서 GET 요청을 하고 결과를 useState에 보관 → {data, error, reload}를 반환한다. url이 null이면 조회하지 않는다. 이전 화면의 늦은 응답은 active=false로 무시한다.

### reload

원본 8행.

입력 없음 → revision 값을 1 증가 → useEffect가 다시 실행되어 같은 주소를 재조회한다. useCallback으로 감싼 화살표 함수다.

### useAction

원본 28행.

입력 없음 → 결과 문구와 busy 상태를 만들고 run을 준비 → {message, busy, run}을 반환한다.

### run

원본 31행.

실행할 함수 action을 받는다 → busy=true, 이전 문구 제거, await action(), 성공/실패 문구 저장 → 성공 결과를 반환한다. finally에서 busy=false로 되돌린다. 실패는 문구로 표시하고 별도로 다시 던지지 않는다.

<a id="file-32"></a>

## client/src/style.css

역할: 기본 메뉴·입력 폼·영상 크기 서식

[실제 파일](../client/src/style.css)

이름 있는 사용자 함수는 없다. 시작 구문·화면 틀·테이블·설정·자료 또는 문서다. 해당 역할과 연결은 인수인계서의 수정 파일 표를 참고한다.

<a id="file-33"></a>

## database/certs/filess-ca.pem

역할: 온라인 MySQL TLS 검증용 공개 CA 인증서

[실제 파일](../database/certs/filess-ca.pem)

이름 있는 사용자 함수는 없다. 시작 구문·화면 틀·테이블·설정·자료 또는 문서다. 해당 역할과 연결은 인수인계서의 수정 파일 표를 참고한다.

<a id="file-34"></a>

## database/migrate.js

역할: 기존 자료를 유지하면서 새 열·설정 행 준비

[실제 파일](../database/migrate.js)

### migrate

원본 4행.

information_schema로 열 존재를 확인해 username·video_status·hls_key·popup_enabled만 추가한다. 기존 영상은 ORIGINAL로 표시하고 기본 site_settings 행을 준비한다. 반복 실행해도 기존 행을 초기화하지 않는다.

<a id="file-35"></a>

## database/schema.sql

역할: MySQL 테이블과 연결 관계 정의

[실제 파일](../database/schema.sql)

이름 있는 사용자 함수는 없다. 시작 구문·화면 틀·테이블·설정·자료 또는 문서다. 해당 역할과 연결은 인수인계서의 수정 파일 표를 참고한다.

<a id="file-36"></a>

## docs/API.md

역할: 설명 문서

[실제 파일](../docs/API.md)

이름 있는 사용자 함수는 없다. 시작 구문·화면 틀·테이블·설정·자료 또는 문서다. 해당 역할과 연결은 인수인계서의 수정 파일 표를 참고한다.

<a id="file-37"></a>

## docs/HANDOFF.md

역할: 설명 문서

[실제 파일](../docs/HANDOFF.md)

이름 있는 사용자 함수는 없다. 시작 구문·화면 틀·테이블·설정·자료 또는 문서다. 해당 역할과 연결은 인수인계서의 수정 파일 표를 참고한다.

<a id="file-38"></a>

## docs/architecture.md

역할: 설명 문서

[실제 파일](../docs/architecture.md)

이름 있는 사용자 함수는 없다. 시작 구문·화면 틀·테이블·설정·자료 또는 문서다. 해당 역할과 연결은 인수인계서의 수정 파일 표를 참고한다.

<a id="file-39"></a>

## docs/code-map.md

역할: 폴더 구조와 코드 읽는 순서

[실제 파일](../docs/code-map.md)

이름 있는 사용자 함수는 없다. 시작 구문·화면 틀·테이블·설정·자료 또는 문서다. 해당 역할과 연결은 인수인계서의 수정 파일 표를 참고한다.

<a id="file-40"></a>

## docs/functions.md

역할: 현재 파일·함수 설명 전체 목록

[실제 파일](../docs/functions.md)

이름 있는 사용자 함수는 없다. 시작 구문·화면 틀·테이블·설정·자료 또는 문서다. 해당 역할과 연결은 인수인계서의 수정 파일 표를 참고한다.

<a id="file-41"></a>

## docs/kakao-setup.md

역할: 카카오 개발자 앱과 로컬 설정 방법

[실제 파일](../docs/kakao-setup.md)

이름 있는 사용자 함수는 없다. 시작 구문·화면 틀·테이블·설정·자료 또는 문서다. 해당 역할과 연결은 인수인계서의 수정 파일 표를 참고한다.

<a id="file-42"></a>

## docs/requirements-status.md

역할: 설명 문서

[실제 파일](../docs/requirements-status.md)

이름 있는 사용자 함수는 없다. 시작 구문·화면 틀·테이블·설정·자료 또는 문서다. 해당 역할과 연결은 인수인계서의 수정 파일 표를 참고한다.

<a id="file-43"></a>

## package-lock.json

역할: 설치할 라이브러리 버전 고정

[실제 파일](../package-lock.json)

이름 있는 사용자 함수는 없다. 시작 구문·화면 틀·테이블·설정·자료 또는 문서다. 해당 역할과 연결은 인수인계서의 수정 파일 표를 참고한다.

<a id="file-44"></a>

## package.json

역할: 프로젝트 실행 명령·라이브러리 목록

[실제 파일](../package.json)

이름 있는 사용자 함수는 없다. 시작 구문·화면 틀·테이블·설정·자료 또는 문서다. 해당 역할과 연결은 인수인계서의 수정 파일 표를 참고한다.

<a id="file-45"></a>

## scripts/init-db.js

역할: 스키마·마이그레이션·최초 관리자 준비

[실제 파일](../scripts/init-db.js)

### initialize

원본 7행.

schema.sql 문장을 실행하고 migrate()로 기존 DB의 새 열을 준비한 뒤 기본 역할을 INSERT IGNORE한다. 기존 자료는 지우지 않는다.

### createInitialAdmin

원본 20행.

환경 변수 ADMIN_* 사용 → 회원이 한 명도 없을 때만 최초 관리자 INSERT → 기존 회원이 있으면 종료. initialize()를 import한 테스트에서는 자동 호출하지 않는다.

<a id="file-46"></a>

## scripts/local-db.js

역할: 이 PC의 MathSite 전용 테스트 MySQL 시작·중지

[실제 파일](../scripts/local-db.js)

### connect

원본 12행.

root(기본 false) → 로컬 환경 설정으로 MySQL 연결 생성 → connection 반환. root=true는 비공개 로컬 관리 설정을 읽는다.

### main

원본 26행.

명령행 start/stop을 읽는다 → start는 실행 확인 후 필요하면 mysqld를 숨김 실행하고 연결 대기, stop은 데이터 경로가 MathSite 전용인지 확인 후 SHUTDOWN → 결과 출력.

<a id="file-47"></a>

## scripts/nginx.js

역할: 전용 Nginx 설정 생성·검사·시작·중지

[실제 파일](../scripts/nginx.js)

### running

원본 15행.

전용 PID 파일의 양의 정수 PID가 실행 중인지 검사한다. nginx -t가 만든 빈 PID 파일은 실행 상태로 취급하지 않는다.

### configure

원본 26행.

포트·HLS 경로를 검증하고 템플릿을 .local의 전용 설정으로 생성한 뒤 nginx -t를 실행한다.

<a id="file-48"></a>

## server/nginx.conf.template

역할: 설정·자료 파일

[실제 파일](../server/nginx.conf.template)

이름 있는 사용자 함수는 없다. 시작 구문·화면 틀·테이블·설정·자료 또는 문서다. 해당 역할과 연결은 인수인계서의 수정 파일 표를 참고한다.

<a id="file-49"></a>

## src/app.js

역할: Express 앱과 공통 처리 순서·API 라우터 연결

[실제 파일](../src/app.js)

### 공통 미들웨어 1

원본 10행.

요청의 req.body가 없으면 {}로 만들고 next()로 다음 처리에 넘긴다.

### GET /health

원본 28행.

req, res를 받는다 → SELECT 1로 DB를 확인 → 서버 상태·현재 로그인 사용자·API 주소를 JSON으로 응답한다.

### 공통 미들웨어 2

원본 56행.

등록된 /api 요청이 앞선 라우터에서 처리되지 않았을 때 → HTTP 404 JSON 응답. 화면 HTML로 잘못 응답하지 않게 한다.

### 공통 미들웨어 3

원본 59행.

React 화면 라우터까지 처리하지 못한 주소 → HTTP 404 JSON 응답한다.

### 공통 미들웨어 4

원본 61행.

error, req, res, next를 받는 오류 미들웨어다 → 중복값·참조 중 데이터·업로드 용량·일반 오류를 구분 → 적절한 HTTP 상태와 message JSON을 응답한다.

<a id="file-50"></a>

## src/database.js

역할: MySQL 연결 풀과 SQL 실행 공통 함수

[실제 파일](../src/database.js)

### query

원본 29행.

sql 문자열과 values 배열(기본 [])을 받는다 → pool.execute(sql, values) → 조회 행 배열 또는 INSERT/UPDATE/DELETE 결과 객체를 반환한다. SQL의 ?에 values가 들어간다.

<a id="file-51"></a>

## src/frontend.js

역할: Express에서 React 실행·빌드 결과를 제공

[실제 파일](../src/frontend.js)

### 공통 미들웨어 1

원본 11행.

req, res, next를 받는다 → vite가 있으면 개발 미들웨어, 없으면 빌드된 정적 파일 제공 함수를 호출한다.

### GET [화면 주소들]

원본 14행.

화면 주소로 GET 요청 → 개발은 index.html을 Vite로 변환, 일반 실행은 빌드된 index.html 전송 → React가 이후 App.jsx에서 화면을 선택한다.

### configureFrontend

원본 41행.

HTTP server와 development 여부를 받는다 → 개발 모드면 Vite 서버를 만들고 같은 HTTP 서버에 HMR을 연결 → 설정 완료. 일반 실행이면 바로 반환한다. 서버 close 콜백은 Vite를 닫는다.

<a id="file-52"></a>

## src/middleware/session-user.js

역할: 세션을 사용자 정보로 바꾸고 요청 출처 확인

[실제 파일](../src/middleware/session-user.js)

### currentUser

원본 5행.

req, res, next를 받는다 → 세션의 userId로 DB를 조회하고 active·session_version 일치 검사 → 유효하면 req.user 저장, 무효면 세션 재생성·쿠키 제거 후 next(). 매 요청 최신 정지·역할 변경을 반영한다.

### sameOrigin

원본 18행.

req, res, next를 받는다 → 변경 요청에 Origin 헤더가 있으면 현재 host·protocol과 비교 → 다르면 403, 같거나 검사 대상이 아니면 next(). Origin이 없는 요청을 무조건 거절하는 구현은 아니다.

<a id="file-53"></a>

## src/modules/auth/controller.js

역할: 아이디·이메일 인증·가입·재설정

[실제 파일](../src/modules/auth/controller.js)

### status

원본 14행.

req.user를 읽는다 → 로그인 여부 판단 → {loggedIn, user} JSON 응답.

### register

원본 18행.

이름·이메일·선택적 username·비밀번호를 검증하고 student/pending 회원을 저장한다. 클라이언트가 보낸 관리자 역할은 채택하지 않는다.

### login

원본 34행.

identifier 또는 기존 email 입력을 받아 아이디/이메일을 검증한다. DB에서 계정·비밀번호·active 여부 확인 후 공통 loginSession을 생성하고 user를 응답한다.

### logout

원본 48행.

현재 세션을 받는다 → destroy 완료를 기다리고 쿠키 제거 → 로그아웃 완료 JSON 응답.

### reset

원본 56행.

토큰 없는 요청은 SMTP 준비·이메일을 확인하고 일회용 토큰 해시 저장 후 mail.sendReset을 호출한다. 발송 실패 시 새 토큰을 정리한다. 토큰 요청은 트랜잭션으로 새 해시·세션 버전을 변경하고 토큰을 사용 처리한다.

<a id="file-54"></a>

## src/modules/auth/kakao.client.js

역할: 카카오 서버와 HTTP 통신

[실제 파일](../src/modules/auth/kakao.client.js)

### authorizationUrl

원본 3행.

config, state를 받는다 → 카카오 인증에 필요한 query string 생성 → 카카오 로그인 URL 문자열 반환.

### kakaoRequest

원본 14행.

url, options를 받는다 → 10초 제한으로 외부 요청, JSON 해석 → 응답 객체 반환. 큰 회원번호는 문자열로 보존하고 실패 시 민감한 원문 대신 일반 오류를 던진다.

### exchangeCode

원본 38행.

config, 인가 code를 받는다 → 토큰 요청 후 토큰으로 /v2/user/me 요청 → 검증된 카카오 고유 회원번호 문자열 반환. 토큰을 프론트나 DB에 저장하지 않는다.

<a id="file-55"></a>

## src/modules/auth/kakao.config.js

역할: 카카오 설정 읽기·검사

[실제 파일](../src/modules/auth/kakao.config.js)

### kakaoConfig

원본 5행.

입력 없음 → 환경 변수와 callback URL 형식을 검사 → 설정 객체와 configured 여부·앱 키 해시 반환.

### requireKakaoConfig

원본 35행.

입력 없음 → kakaoConfig 호출 → 설정이 없으면 503, 있으면 설정 객체 반환.

<a id="file-56"></a>

## src/modules/auth/kakao.controller.js

역할: 카카오 로그인 전체 흐름 제어

[실제 파일](../src/modules/auth/kakao.controller.js)

### validPending

원본 9행.

req, config → 세션에 남은 최초 가입 정보의 만료·앱 일치 검사 → 유효 정보 또는 null 반환.

### status

원본 16행.

req, res → 설정·추가 가입 필요·연결 여부 확인 → 키 없이 configured, registrationRequired, linked만 JSON 응답.

### start

원본 29행.

로그인 시작 또는 /link 요청 → 호스트 확인, 임의 state와 10분 만료 정보를 세션에 저장 → 카카오 인증 주소로 303 이동.

### callback

원본 51행.

카카오에서 돌아온 code·state → 일회용 state·만료·세션 검사, exchangeCode로 회원번호 확인 → 기존 회원 로그인 / 기존 계정 연결 / 최초 가입 정보 보관 중 하나를 수행하고 화면으로 이동.

### register

원본 93행.

카카오 최초 인증 세션과 이름·이메일 → 인증 만료·중복 검사, registerAccount → 세션 재생성 후 승인 대기 회원을 201 응답.

<a id="file-57"></a>

## src/modules/auth/kakao.repository.js

역할: 우리 회원과 카카오 계정 연결 정보를 DB에 저장

[실제 파일](../src/modules/auth/kakao.repository.js)

### findAccount

원본 5행.

appKeyHash, kakaoId → kakao_accounts와 users JOIN 조회 → 연결된 회원의 id·status 또는 undefined 반환.

### hasConnection

원본 14행.

appKeyHash, userId → 연결 존재 조회 → true/false 반환.

### linkAccount

원본 22행.

appKeyHash, kakaoId, userId → 기존 연결 확인 → 같은 계정이면 종료, 다른 회원 연결이면 409, 새 연결이면 INSERT.

### registerAccount

원본 33행.

인증된 identity, name, email → 임의 비밀번호 해시 준비, 트랜잭션으로 student 회원과 카카오 연결을 함께 INSERT → pending 회원 객체 반환. 실패하면 rollback한다.

<a id="file-58"></a>

## src/modules/auth/kakao.routes.js

역할: 카카오 인증 URL과 controller 연결

[실제 파일](../src/modules/auth/kakao.routes.js)

### 공통 미들웨어 1

원본 6행.

req, res, next → 응답에 no-store·no-referrer 헤더를 붙임 → next(). 인증 응답 캐시와 이전 주소 전달을 제한한다.

### GET /auth/kakao/status

원본 10행.

controller.status → 카카오 연결 상태 JSON.

### GET /auth/kakao

원본 11행.

controller.start → 카카오 로그인 시작.

### GET /auth/kakao/link

원본 12행.

requireLogin 후 controller.start → 현재 로그인 계정에 카카오 연결 시작.

### GET /auth/kakao/callback

원본 13행.

controller.callback → 카카오 인증 결과 처리.

### POST /auth/kakao/register

원본 14행.

controller.register → 이름·이메일 추가 가입.

<a id="file-59"></a>

## src/modules/auth/mail.js

역할: SMTP와 로컬 시험 메일 전달을 분리

[실제 파일](../src/modules/auth/mail.js)

### mailConfigured

원본 7행.

SMTP_HOST·MAIL_FROM·APP_URL의 설정 유무를 Boolean으로 반환한다. 실제 SMTP 인증 성공을 의미하지는 않는다.

### requireMail

원본 11행.

파일 시험 모드 이외에는 SMTP 설정을 요구한다. 미설정이면 503으로 중단한다.

### sendReset

원본 16행.

수신 이메일·토큰을 받아 고정 APP_URL로 재설정 링크를 만든다. file 모드는 비공개 파일, smtp 모드는 Nodemailer로 전달한다. TLS·시간 제한을 적용하고 공급자 오류 원문은 사용자에게 내보내지 않는다.

<a id="file-60"></a>

## src/modules/auth/routes.js

역할: 이메일 인증 주소와 controller 함수 연결

[실제 파일](../src/modules/auth/routes.js)

### GET /api/auth/status

원본 5행.

controller.status(req, res) 호출 → 로그인 상태 응답.

### POST /api/auth/register

원본 6행.

controller.register 호출 → 이메일 회원가입.

### POST /api/auth/login

원본 7행.

controller.login 호출 → 이메일 로그인.

### POST /api/auth/logout

원본 8행.

controller.logout 호출 → 세션 로그아웃.

### POST /api/auth/reset

원본 9행.

controller.reset 호출 → 재설정 요청 또는 토큰으로 비밀번호 변경.

<a id="file-61"></a>

## src/modules/auth/session.js

역할: 이메일·카카오가 공유하는 로그인 세션 처리

[실제 파일](../src/modules/auth/session.js)

### saveSession

원본 4행.

req를 받는다 → req.session.save의 콜백을 Promise로 감싼다 → 저장 완료 또는 오류를 await할 수 있다.

### regenerateSession

원본 10행.

req를 받는다 → req.session.regenerate를 Promise로 감싼다 → 새 세션 ID로 교체 완료를 기다린다.

### loginSession

원본 17행.

req, userId를 받는다 → DB에서 회원·역할과 active 여부 확인, 세션 재생성, userId·version 저장 → publicUser(account)를 반환한다.

<a id="file-62"></a>

## src/modules/boards/routes.js

역할: 공지 CRUD·고정·팝업

[실제 파일](../src/modules/boards/routes.js)

### getBoard

원본 7행.

공지 ID → SELECT와 존재 검사 → 공지 객체 반환 또는 404.

### GET /api/boards

원본 13행.

선택적 q → 제목 검색, 고정 공지 우선·최신순 조회 → {boards}.

### GET /api/boards/popup

원본 23행.

로그인 사용자에게 popup_enabled인 최신 공지 한 개 또는 null을 응답한다.

### POST /api/boards

원본 30행.

관리자 제목·본문·팝업·고정 여부를 검증해 공지를 생성한다.

### GET /api/boards/:boardId

원본 44행.

boardId → getBoard → {board}.

### PATCH /api/boards/:boardId

원본 48행.

관리자가 기존 값과 입력을 합쳐 제목·본문·팝업·고정 여부를 수정한다.

### DELETE /api/boards/:boardId

원본 66행.

관리자, boardId → DELETE → 완료 또는 404.

### PATCH /api/boards/:boardId/pin

원본 72행.

관리자, boardId, isPinned → 고정 여부 UPDATE → 변경 공지.

<a id="file-63"></a>

## src/modules/courses/lectures.routes.js

역할: 강좌 하위 영상 업로드·변환·보호된 원본/HLS 재생

[실제 파일](../src/modules/courses/lectures.routes.js)

### filename

원본 28행.

req, 업로드 file, done → UUID에 원래 확장자를 붙임 → done(null, 새 파일명). 파일명이 겹치는 것을 피한다.

### fileFilter

원본 32행.

req, file, done → 확장자가 .mp4/.webm인지 확인 → 허용 또는 오류를 done에 전달. 실제 파일 내용은 checkVideo에서 추가 확인한다.

### checkVideo

원본 43행.

업로드 file → 파일 앞 12바이트 읽고 MP4/WebM 서명 확인 → MIME 문자열 반환, 파일 없으면 null, 위장이면 400. 파일 전체를 디코딩하는 검사는 아니다.

### 공통 미들웨어 1

원본 62행.

주소의 courseId와 req.user → getCourse로 강좌 접근 확인, req.course에 저장 → next().

### GET /api/courses/:courseId/lectures

원본 67행.

강좌 ID와 q를 받아 강의 제목 검색을 한다. 학생은 공개·기간 유효 강의만 조회하고 파일 경로를 숨겨 응답한다.

### POST /api/courses/:courseId/lectures

원본 82행.

관리자 FormData 파일·제목 등을 검증해 저장하고 파일이 있으면 FFmpeg 변환 큐에 넣는다. DB 저장 전 실패한 업로드는 정리한다.

### PATCH /api/courses/:courseId/lectures/:lectureId

원본 118행.

관리자 변경 값을 저장한다. 파일 교체 시 이전 변환을 취소하고 새 파일 변환을 등록하며 이전 원본·HLS를 정리한다.

### DELETE /api/courses/:courseId/lectures/:lectureId

원본 161행.

관리자·강좌 소속을 확인하고 해당 변환 취소 후 DB·원본·HLS를 삭제한다.

### POST /api/courses/:courseId/lectures/:lectureId/playback

원본 170행.

현재 시청 권한과 영상 존재를 확인하고 READY HLS 또는 보호된 원본의 주소·format을 응답한다.

### POST /api/courses/:courseId/lectures/:lectureId/convert

원본 184행.

관리자가 기존 원본의 변환·실패 재시도를 요청한다. 변환 중 중복 요청은 409, 등록은 202로 응답한다.

### GET /api/courses/:courseId/lectures/:lectureId/hls/:key/:asset

원본 192행.

모든 재생 목록·조각 요청에 현재 권한·게시 상태·폴더 키·파일 형식을 검사한다. Nginx 경유는 X-Accel-Redirect, 직접 요청은 검증된 파일만 전송한다.

### GET /api/courses/:courseId/lectures/:lectureId

원본 207행.

현재 로그인 사용자와 강의 ID → 권한 재검사. ?info=1이면 메타데이터 JSON, 그 외는 영상 바이트 응답. Range 헤더가 있으면 206 부분 전송, 잘못된 범위는 416. stream error/close 콜백은 연결·파일 스트림을 정리한다.

<a id="file-64"></a>

## src/modules/courses/routes.js

역할: 강좌 CRUD·검색과 하위 강의 연결

[실제 파일](../src/modules/courses/routes.js)

### GET /api/courses

원본 20행.

선택적 req.query.q와 req.user → 제목 검색, 학생이면 현재 허용된 공개 강의가 있는 공개 강좌만 SQL로 선택 → {courses} JSON.

### POST /api/courses

원본 34행.

관리자의 title·description·teacher·isPublished → 검증·INSERT → 201 {message, course}.

### GET /api/courses/:courseId

원본 52행.

주소의 courseId와 user → getCourse로 접근 확인 → {course} JSON.

### PATCH /api/courses/:courseId

원본 56행.

관리자, courseId, 바꿀 필드 → 기존 값과 합쳐 UPDATE → {message, course}.

### DELETE /api/courses/:courseId

원본 78행.

관리자가 강좌 소속 변환 작업을 취소한 뒤 DB 강좌·원본·HLS 파일을 정리하고 완료 응답한다.

### PATCH /api/courses/:courseId/status

원본 90행.

관리자, courseId, isPublished → 공개 여부만 UPDATE → 변경된 강좌 응답.

<a id="file-65"></a>

## src/modules/courses/video.js

역할: FFmpeg HLS 순차 변환·취소·복구

[실제 파일](../src/modules/courses/video.js)

### hlsPath

원본 12행.

UUID와 index.m3u8/segment-00000.ts 형식만 허용하고 HLS 저장 폴더 아래 경로를 반환한다.

### removeHls

원본 21행.

key를 받아 대상이 HLS 루트의 직계 하위인지 확인하고 그 변환 폴더만 지운다.

### runFfmpeg

원본 28행.

원본 경로·결과 폴더·작업 객체를 받는다. shell 없이 FFmpeg를 실행해 H.264/AAC HLS로 변환하고 종료까지 기다리는 Promise를 반환한다.

### convert

원본 87행.

강의 ID·파일명·작업 객체를 받는다. 고유 폴더에 변환하고 같은 원본이 아직 DB에 있을 때 READY/hls_key를 저장한다. 삭제·교체된 자료나 실패 결과는 정리한다.

### queueConversion

원본 117행.

기존 같은 강의 작업을 취소하고 PROCESSING으로 저장한 뒤 순차 큐에 넣는다. 요청은 전체 변환 완료까지 기다리지 않는다.

### cancelConversion

원본 134행.

강의 ID가 같은 대기 작업을 취소 표시하고 실행 중 FFmpeg는 종료·닫힘을 기다린다. Windows 파일 잠금 상태에서 교체·삭제하는 문제를 피한다.

### resumeConversions

원본 145행.

서버 시작 시 DB의 PROCESSING 강의를 조회해 큐에 다시 넣는다.

### waitForConversions

원본 159행.

현재 큐 완료 Promise를 반환한다. 테스트가 변환·파일 정리 완료를 기다릴 때 사용한다.

<a id="file-66"></a>

## src/modules/info/routes.js

역할: 공개 설정 하위 라우터와 로그인 Q&A

[실제 파일](../src/modules/info/routes.js)

### getQuestion

원본 8행.

질문 ID, user → 조회·존재·비공개 접근 검사 → 질문 객체 또는 오류.

### GET /api/info/qna

원본 16행.

현재 user → 관리자 전체, 학생은 공개 또는 본인 질문 조회 → {questions}.

### POST /api/info/qna

원본 24행.

title·content·isPrivate → 입력 검사, 작성자를 req.user.id로 INSERT → 201 질문. 비공개 기본값 true.

### GET /api/info/qna/:questionId

원본 40행.

questionId와 user → getQuestion → {question}.

### PATCH /api/info/qna/:questionId

원본 44행.

questionId와 변경 내용 → 조회 권한·작성자 검사 → UPDATE 후 질문 응답. 관리자도 남의 질문 본문을 수정하지 못한다.

### DELETE /api/info/qna/:questionId

원본 63행.

questionId → 작성자 또는 관리자 검사 → 삭제 결과.

### POST /api/info/qna/:questionId/answer

원본 71행.

관리자의 answer → 기존 답변 없음 확인 → 답변·답변자 저장, 201 응답.

### PATCH /api/info/qna/:questionId/answer

원본 85행.

관리자의 answer → 기존 답변 존재 확인 → 답변 수정 결과.

### DELETE /api/info/qna/:questionId/answer

원본 96행.

관리자와 questionId → 답변 존재 확인 → answer·answered_by를 NULL로 바꾸고 완료 응답.

<a id="file-67"></a>

## src/modules/info/settings.routes.js

역할: 공개 채널 주소 조회·관리자 설정

[실제 파일](../src/modules/info/settings.routes.js)

### GET /api/info/settings

원본 7행.

채널 주소를 JSON으로 반환한다. 관리자에게만 SMTP 설정 유무를 추가하며 비밀번호·인증키는 반환하지 않는다.

### PATCH /api/info/settings

원본 15행.

관리자만 channelUrl을 변경한다. 비우기 또는 HTTPS의 pf.kakao.com 채널 경로만 허용하고 DB에 저장한다.

<a id="file-68"></a>

## src/modules/manager/routes.js

역할: 관리자 전용 회원·역할·시청 권한 관리 API

[실제 파일](../src/modules/manager/routes.js)

### getUser

원본 7행.

회원 ID → userSelect로 조회·존재 검사 → 공개용 회원 객체 반환.

### changeUser

원본 13행.

회원 ID, changes(remove/status/role) → 트랜잭션과 행 잠금으로 마지막 활성 관리자 보호 → 삭제 또는 상태·역할 변경, 세션 버전 증가. 실패 시 rollback, 종료 시 connection.release().

### GET /api/manager/users

원본 51행.

관리자 요청 → 회원+역할 목록 조회 → {users}.

### GET /api/manager/users/:userId

원본 54행.

userId → getUser → {user}.

### GET /api/manager/users/:userId/role

원본 57행.

userId → 회원의 roleId·role·roleName만 JSON 응답.

### PATCH /api/manager/users/:userId/role

원본 62행.

userId와 body.roleId → 역할 존재 확인, changeUser → 갱신 회원 응답.

### PATCH /api/manager/users/:userId/status

원본 69행.

userId와 pending/active/suspended → 값 검사, changeUser → 승인·정지 결과 응답.

### DELETE /api/manager/users/:userId

원본 76행.

userId → changeUser(remove:true) → 삭제 결과 응답.

### GET /api/manager

원본 81행.

역할 목록 조회 → {roles}.

### POST /api/manager

원본 84행.

code와 name → 역할 코드 형식 검사, 새 일반 역할 INSERT → 201 roleId. can_manage를 임의 지정하는 기능은 없다.

### PATCH /api/manager

원본 94행.

roleId와 name → 역할 이름 UPDATE → 완료 JSON.

### DELETE /api/manager

원본 102행.

roleId → 기본 admin/student 역할 삭제 금지, 그 외 DELETE → 완료 JSON. 사용 중인 역할은 DB 외래키로도 삭제가 막힌다.

### GET /api/manager/users/:userId/lectures

원본 110행.

userId → 부여된 강의와 시작·만료 시각·현재 유효 여부 조회 → {access}.

### POST /api/manager/users/:userId/lectures

원본 121행.

userId, lectureId, 선택적 startsAt·expiresAt → 회원·강의·기간 검사, 새 권한 INSERT 또는 기존 기간 UPDATE → 201 결과. 생략한 만료는 30일 뒤.

### DELETE /api/manager/users/:userId/lectures/:lectureId

원본 150행.

회원 ID와 강의 ID → lecture_access DELETE → 회수 결과 또는 404.

<a id="file-69"></a>

## src/modules/user/routes.js

역할: 본인 이름·이메일·아이디 수정

[실제 파일](../src/modules/user/routes.js)

### GET /api/user

원본 15행.

req.user → {user} JSON 응답.

### PATCH /api/user

원본 17행.

name·email·username만 허용해 검증한다. 자기 user ID로 UPDATE하고 공개 회원 객체를 응답한다. 역할·상태 위조 입력은 거절한다.

<a id="file-70"></a>

## src/server.js

역할: DB 확인·React 연결·변환 복구 후 HTTP 서버 시작

[실제 파일](../src/server.js)

이름 있는 사용자 함수는 없다. 시작 구문·화면 틀·테이블·설정·자료 또는 문서다. 해당 역할과 연결은 인수인계서의 수정 파일 표를 참고한다.

<a id="file-71"></a>

## src/shared/helpers.js

역할: 입력·비밀번호·회원·시청 권한·파일 공통 함수

[실제 파일](../src/shared/helpers.js)

### fail

원본 8행.

status, message를 받는다 → Error에 HTTP 상태를 넣고 throw → app.js 오류 미들웨어가 응답한다.

### text

원본 14행.

value, label, max(기본 160)를 받는다 → 문자열 여부·공백 제거 후 길이 검사 → 정리한 문자열 반환, 잘못되면 400.

### id

원본 21행.

value를 받는다 → 1 이상의 안전한 정수인지 검사 → 숫자 ID 반환, 잘못되면 400.

### bool

원본 28행.

value를 받는다 → true/false, 1/0와 해당 문자열을 판별 → Boolean 반환, 잘못되면 400.

### email

원본 34행.

value를 받는다 → text 검증·소문자 변환·기본 이메일 형식 검사 → 정리한 이메일 반환.

### hashPassword

원본 40행.

비밀번호를 받는다 → 8~128자 검사, 무작위 salt와 scrypt 해시 생성 → salt:hash 문자열 반환. 원래 비밀번호를 저장하지 않는다.

### verifyPassword

원본 49행.

입력 비밀번호와 저장된 salt:hash를 받는다 → 같은 방식으로 해시 계산 후 timingSafeEqual 비교 → 일치 여부 반환.

### publicUser

원본 61행.

회원 조회 객체를 받는다 → session_version 제거, canManage를 Boolean으로 변환 → 화면에 보낼 회원 객체 반환. password_hash 없는 userSelect 결과를 전달하는 전제다.

### requireLogin

원본 66행.

req, res, next → req.user가 없으면 401 JSON, 있으면 next().

### requireAdmin

원본 71행.

req, res, next → 비로그인 401, canManage=false면 403, 관리자면 next().

### getCourse

원본 80행.

courseId, user를 받는다 → 강좌 존재 조회, 학생이면 공개 강좌 안에 현재 시청 가능한 공개 강의가 하나 이상인지 확인 → 강좌 반환 또는 403/404.

### getLecture

원본 94행.

courseId, lectureId, user를 받는다 → getCourse 검사, 해당 강좌 소속 강의인지 검사, 학생의 게시 여부·강의별 허용 기간 검사 → 강의 반환 또는 오류.

### publicLecture

원본 111행.

서버 파일명·MIME·HLS 폴더 키를 제거하고 videoStatus를 포함한 공개 강의 객체를 반환한다.

### username

원본 123행.

아이디를 소문자로 정리하고 영문 시작의 영문·숫자·밑줄 4~40자인지 검사해 반환한다.

### videoPath

원본 132행.

filename을 받는다 → 폴더 경로가 섞이지 않은 단순 파일명인지 검사 → uploadDir 아래의 절대 경로 반환.

### removeVideo

원본 138행.

filename을 받는다 → videoPath로 경로 확인 후 파일 삭제 → 파일이 없으면 무시, 다른 오류는 다시 던진다.

<a id="file-72"></a>

## tests/api.test.js

역할: Mocha로 API와 권한의 실제 동작 검사

[실제 파일](../tests/api.test.js)

### client

원본 20행.

입력 없음 → 현재 임시 서버 주소를 사용하는 httpClient 생성 → 요청 함수 반환.

### login

원본 24행.

request 함수, 이메일, 비밀번호 → POST /api/auth/login 후 assert.equal(status,200) → 로그인 user 반환.

### before

원본 31행.

전용 로컬 테스트 DB와 합성 자료·임시 서버를 준비한다. 공유 개발 DB는 사용하지 않는다.

### after

원본 72행.

변환·임시 서버·DB 연결과 시험용 파일을 정리한다. Nginx 통합 시험은 전용 Nginx도 중지한다.

### React 화면의 직접 주소·새로고침과 빌드 자산 제공, API 404 분리

원본 91행.

검사: React 화면의 직접 주소·새로고침과 빌드 자산 제공, API 404 분리. 실제 요청 결과와 권한·저장 상태를 assert로 확인한다.

### 서버 상태, 비로그인 차단, 세션 로그인·로그아웃

원본 107행.

검사: 서버 상태, 비로그인 차단, 세션 로그인·로그아웃. 실제 요청 결과와 권한·저장 상태를 assert로 확인한다.

### 강좌 목록 필터, 관리자 CRUD, 학생 수정 차단, MySQL 저장

원본 127행.

검사: 강좌 목록 필터, 관리자 CRUD, 학생 수정 차단, MySQL 저장. 실제 요청 결과와 권한·저장 상태를 assert로 확인한다.

### 같은 학생 역할도 영상별 허용·미허용·만료·미게시 여부로 구분

원본 160행.

검사: 같은 학생 역할도 영상별 허용·미허용·만료·미게시 여부로 구분. 실제 요청 결과와 권한·저장 상태를 assert로 확인한다.

### 실제 영상 업로드·부분 재생·권한 부여와 회수·다른 강좌 ID 차단

원본 201행.

검사: 실제 영상 업로드·부분 재생·권한 부여와 회수·다른 강좌 ID 차단. 실제 요청 결과와 권한·저장 상태를 assert로 확인한다.

### 학생 업로드·권한 자체 부여 차단과 위장 파일 검증

원본 242행.

검사: 학생 업로드·권한 자체 부여 차단과 위장 파일 검증. 실제 요청 결과와 권한·저장 상태를 assert로 확인한다.

### 공지 관리자 CRUD·고정, 학생 작성·수정·삭제 거절

원본 262행.

검사: 공지 관리자 CRUD·고정, 학생 작성·수정·삭제 거절. 실제 요청 결과와 권한·저장 상태를 assert로 확인한다.

### Q&A 비공개, 작성자 수정, 관리자 답변 등록·수정·삭제

원본 284행.

검사: Q&A 비공개, 작성자 수정, 관리자 답변 등록·수정·삭제. 실제 요청 결과와 권한·저장 상태를 assert로 확인한다.

### 회원가입은 승인 대기, 역할 위조 불가, 관리자 승인 후 로그인

원본 324행.

검사: 회원가입은 승인 대기, 역할 위조 불가, 관리자 승인 후 로그인. 실제 요청 결과와 권한·저장 상태를 assert로 확인한다.

### 정지·역할 변경은 기존 세션에도 반영, 마지막 관리자 보호

원본 364행.

검사: 정지·역할 변경은 기존 세션에도 반영, 마지막 관리자 보호. 실제 요청 결과와 권한·저장 상태를 assert로 확인한다.

### 비밀번호 재설정 토큰 비노출·일회용, 변경 후 기존 세션 무효화

원본 397행.

검사: 비밀번호 재설정 토큰 비노출·일회용, 변경 후 기존 세션 무효화. 실제 요청 결과와 권한·저장 상태를 assert로 확인한다.

### 다른 출처 변경 요청과 잘못된 입력을 거절

원본 432행.

검사: 다른 출처 변경 요청과 잘못된 입력을 거절. 실제 요청 결과와 권한·저장 상태를 assert로 확인한다.

<a id="file-73"></a>

## tests/database-env.js

역할: 테스트가 공유 온라인 DB를 건드리지 못하게 설정

[실제 파일](../tests/database-env.js)

이름 있는 사용자 함수는 없다. 시작 구문·화면 틀·테이블·설정·자료 또는 문서다. 해당 역할과 연결은 인수인계서의 수정 파일 표를 참고한다.

<a id="file-74"></a>

## tests/features.test.js

역할: 추가 기능과 실제 FFmpeg·Nginx 통합 검사

[실제 파일](../tests/features.test.js)

### login

원본 23행.

시험 HTTP 클라이언트와 이메일로 합성 계정에 로그인하고 성공한 user를 반환한다.

### freePort

원본 32행.

localhost의 임시 포트를 빌린 뒤 닫고 포트 번호를 반환한다. Nginx 시험 포트를 운영 포트와 분리한다.

### before

원본 41행.

전용 로컬 테스트 DB와 합성 자료·임시 서버를 준비한다. 공유 개발 DB는 사용하지 않는다.

### after

원본 70행.

변환·임시 서버·DB 연결과 시험용 파일을 정리한다. Nginx 통합 시험은 전용 Nginx도 중지한다.

### 마이그레이션 반복 시 기존 회원·강좌 유지

원본 89행.

검사: 마이그레이션 반복 시 기존 회원·강좌 유지. 실제 요청 결과와 권한·저장 상태를 assert로 확인한다.

### 문자열 아이디 가입·중복 거절·승인 후 아이디/이메일 로그인

원본 96행.

검사: 문자열 아이디 가입·중복 거절·승인 후 아이디/이메일 로그인. 실제 요청 결과와 권한·저장 상태를 assert로 확인한다.

### 회원 상세·역할 CRUD·회원 삭제는 관리자만 가능

원본 141행.

검사: 회원 상세·역할 CRUD·회원 삭제는 관리자만 가능. 실제 요청 결과와 권한·저장 상태를 assert로 확인한다.

### 팝업 공지 조회·해제, 학생의 팝업 설정 거절

원본 166행.

검사: 팝업 공지 조회·해제, 학생의 팝업 설정 거절. 실제 요청 결과와 권한·저장 상태를 assert로 확인한다.

### 채널 설정은 관리자만, 외부·스크립트 URL 거절

원본 184행.

검사: 채널 설정은 관리자만, 외부·스크립트 URL 거절. 실제 요청 결과와 권한·저장 상태를 assert로 확인한다.

### SMTP 미설정은 명확히 거절하고 파일 전달 모드는 토큰 비노출

원본 203행.

검사: SMTP 미설정은 명확히 거절하고 파일 전달 모드는 토큰 비노출. 실제 요청 결과와 권한·저장 상태를 assert로 확인한다.

### SMTP 발송 함수의 TLS·메일 내용·수신자 구성 (외부 발송 없이)

원본 222행.

검사: SMTP 발송 함수의 TLS·메일 내용·수신자 구성 (외부 발송 없이). 실제 요청 결과와 권한·저장 상태를 assert로 확인한다.

### 실제 FFmpeg HLS 변환·강의 제목 검색·학생별 권한

원본 262행.

검사: 실제 FFmpeg HLS 변환·강의 제목 검색·학생별 권한. 실제 요청 결과와 권한·저장 상태를 assert로 확인한다.

### 실제 Nginx 내부 파일 제공·직접 URL 차단·회수 후 조각 요청 차단

원본 301행.

검사: 실제 Nginx 내부 파일 제공·직접 URL 차단·회수 후 조각 요청 차단. 실제 요청 결과와 권한·저장 상태를 assert로 확인한다.

<a id="file-75"></a>

## tests/fixtures/sample.mp4

역할: 업로드·부분 재생 검사에 쓰는 짧은 영상

[실제 파일](../tests/fixtures/sample.mp4)

이름 있는 사용자 함수는 없다. 시작 구문·화면 틀·테이블·설정·자료 또는 문서다. 해당 역할과 연결은 인수인계서의 수정 파일 표를 참고한다.

<a id="file-76"></a>

## tests/http-client.js

역할: Mocha 테스트용 HTTP 요청 함수 생성

[실제 파일](../tests/http-client.js)

### client

원본 2행.

baseUrl 함수 → 쿠키 보관 변수를 가진 비동기 요청 함수를 반환. 반환 함수는 method·url·body·추가 헤더를 받아 요청하고 {status, headers, json, bytes}를 반환한다. 인증 리다이렉트는 자동으로 따라가지 않는다.

<a id="file-77"></a>

## tests/kakao.test.js

역할: Mocha로 카카오 인증 흐름 검사

[실제 파일](../tests/kakao.test.js)

### client

원본 21행.

입력 없음 → 임시 서버용 httpClient 생성 → 별도 쿠키를 갖는 요청 함수 반환.

### passwordLogin

원본 25행.

request 함수, email → 테스트 비밀번호로 이메일 로그인하고 성공 검사 → user 반환.

### start

원본 34행.

request, link(기본 false) → 카카오 시작 요청 후 303·인가 URL·시크릿 비노출 검사 → state 반환.

### authorize

원본 45행.

request, kakaoId, link → start로 state 준비, 합성 인가 code에 회원번호 연결 → callback 요청 결과 반환.

### before

원본 53행.

전용 로컬 테스트 DB와 합성 자료·임시 서버를 준비한다. 공유 개발 DB는 사용하지 않는다.

### after

원본 117행.

변환·임시 서버·DB 연결과 시험용 파일을 정리한다. Nginx 통합 시험은 전용 Nginx도 중지한다.

### 미설정은 로그인 503, 상태 API는 키·시크릿을 노출하지 않음

원본 130행.

검사: 미설정은 로그인 503, 상태 API는 키·시크릿을 노출하지 않음. 실제 요청 결과와 권한·저장 상태를 assert로 확인한다.

### state 세션 결합·일회용·만료와 다른 브라우저 callback 차단

원본 149행.

검사: state 세션 결합·일회용·만료와 다른 브라우저 callback 차단. 실제 요청 결과와 권한·저장 상태를 assert로 확인한다.

### 취소·토큰 실패·잘못된 회원번호는 세션 로그인하지 않음

원본 179행.

검사: 취소·토큰 실패·잘못된 회원번호는 세션 로그인하지 않음. 실제 요청 결과와 권한·저장 상태를 assert로 확인한다.

### 최초 카카오 인증 → 이름·이메일 → 승인 대기, 이메일 자동 병합·권한 위조 금지

원본 196행.

검사: 최초 카카오 인증 → 이름·이메일 → 승인 대기, 이메일 자동 병합·권한 위조 금지. 실제 요청 결과와 권한·저장 상태를 assert로 확인한다.

### 관리자는 이메일 인증 후 연결, 카카오 재로그인에도 기존 관리자 유지

원본 271행.

검사: 관리자는 이메일 인증 후 연결, 카카오 재로그인에도 기존 관리자 유지. 실제 요청 결과와 권한·저장 상태를 assert로 확인한다.

### 앱 변경 시 계정 자동 연결 금지, 잘못된 callback 주소 거절, 시크릿 비노출

원본 291행.

검사: 앱 변경 시 계정 자동 연결 금지, 잘못된 callback 주소 거절, 시크릿 비노출. 실제 요청 결과와 권한·저장 상태를 assert로 확인한다.

### Long 회원번호를 반올림하지 않고 저장하고 완료 callback 재사용을 차단

원본 317행.

검사: Long 회원번호를 반올림하지 않고 저장하고 완료 callback 재사용을 차단. 실제 요청 결과와 권한·저장 상태를 assert로 확인한다.

<a id="file-78"></a>

## tests/seed.js

역할: 테스트 전용 회원·강좌·영상·권한 자료 준비

[실제 파일](../tests/seed.js)

### initialize

원본 8행.

입력 없음 → DB 이름이 mathsite_test인지 확인, 스키마 준비 → 비어 있을 때만 관리자·허용 학생·미허용 학생·강좌·두 강의·권한·공지·질문 생성 → {seeded} 반환.

<a id="file-79"></a>

## vite.config.mjs

역할: React 개발·빌드 설정

[실제 파일](../vite.config.mjs)

이름 있는 사용자 함수는 없다. 시작 구문·화면 틀·테이블·설정·자료 또는 문서다. 해당 역할과 연결은 인수인계서의 수정 파일 표를 참고한다.
