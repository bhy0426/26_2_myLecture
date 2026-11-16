# API 목록

현재 구현 2026-11-14. 화면 주소와 JSON API 주소를 구분한다. 로그인은 세션 쿠키 mathsite.sid를 사용한다. 변경 요청의 Origin이 있으면 같은 출처인지 검사한다. 실패는 `{ "message": "안내 문구" }` 형태다.

## 공통 입력 약속

- 일반 가입: username(화면 필수·기존 API는 생략 허용), name, email, password(8~128자). 신규 회원은 pending.
- 로그인: identifier(아이디 또는 이메일), password. 기존 클라이언트의 email도 허용.
- 내 정보: name, email, username 중 변경 항목만. 역할·상태 변경은 관리자 API.
- 강좌: title, description, teacher, isPublished.
- 강의: title, description, position, isPublished와 선택 video 파일. 업로드는 multipart/form-data의 video 필드(MP4/WebM, 250MiB 이하).
- 공지: title, content, popupEnabled, isPinned.
- 질문: title, content, isPrivate. 답변은 answer.
- 회원 상태: status(pending/active/suspended), 역할 변경: roleId. 역할 생성: code, name.
- 시청 권한: lectureId, 선택 startsAt·expiresAt(ISO 날짜). 생략 시 기본 30일.
- 설정: channelUrl. 실제 SMTP 비밀번호는 API로 수정하지 않고 서버 .env에 둔다.

## 전체 주소

카카오 표는 /auth/kakao를 기준으로 적었다. 같은 라우터가 /api/auth/kakao에도 연결된다. 아래 개수는 이 별칭을 중복 집계하지 않는다. GET /health는 별도 서버·DB 상태 검사다.

| 메서드 | 주소                                                         | 권한·조건               | 처리 파일                                                                               |
| ------ | ------------------------------------------------------------ | ----------------------- | --------------------------------------------------------------------------------------- |
| GET    | `/auth/kakao/status`                                         | 인증 흐름·세션 확인     | [src/modules/auth/kakao.routes.js:10](../src/modules/auth/kakao.routes.js)              |
| GET    | `/auth/kakao`                                                | 인증 흐름·세션 확인     | [src/modules/auth/kakao.routes.js:11](../src/modules/auth/kakao.routes.js)              |
| GET    | `/auth/kakao/link`                                           | 로그인                  | [src/modules/auth/kakao.routes.js:12](../src/modules/auth/kakao.routes.js)              |
| GET    | `/auth/kakao/callback`                                       | 인증 흐름·세션 확인     | [src/modules/auth/kakao.routes.js:13](../src/modules/auth/kakao.routes.js)              |
| POST   | `/auth/kakao/register`                                       | 인증 흐름·세션 확인     | [src/modules/auth/kakao.routes.js:14](../src/modules/auth/kakao.routes.js)              |
| GET    | `/api/auth/status`                                           | 공개·인증 검증          | [src/modules/auth/routes.js:5](../src/modules/auth/routes.js)                           |
| POST   | `/api/auth/register`                                         | 공개·인증 검증          | [src/modules/auth/routes.js:6](../src/modules/auth/routes.js)                           |
| POST   | `/api/auth/login`                                            | 공개·인증 검증          | [src/modules/auth/routes.js:7](../src/modules/auth/routes.js)                           |
| POST   | `/api/auth/logout`                                           | 공개·인증 검증          | [src/modules/auth/routes.js:8](../src/modules/auth/routes.js)                           |
| POST   | `/api/auth/reset`                                            | 공개·인증 검증          | [src/modules/auth/routes.js:9](../src/modules/auth/routes.js)                           |
| GET    | `/api/boards`                                                | 로그인                  | [src/modules/boards/routes.js:13](../src/modules/boards/routes.js)                      |
| GET    | `/api/boards/popup`                                          | 로그인                  | [src/modules/boards/routes.js:23](../src/modules/boards/routes.js)                      |
| POST   | `/api/boards`                                                | 관리자                  | [src/modules/boards/routes.js:30](../src/modules/boards/routes.js)                      |
| GET    | `/api/boards/:boardId`                                       | 로그인                  | [src/modules/boards/routes.js:44](../src/modules/boards/routes.js)                      |
| PATCH  | `/api/boards/:boardId`                                       | 관리자                  | [src/modules/boards/routes.js:48](../src/modules/boards/routes.js)                      |
| DELETE | `/api/boards/:boardId`                                       | 관리자                  | [src/modules/boards/routes.js:66](../src/modules/boards/routes.js)                      |
| PATCH  | `/api/boards/:boardId/pin`                                   | 관리자                  | [src/modules/boards/routes.js:72](../src/modules/boards/routes.js)                      |
| GET    | `/api/courses/:courseId/lectures`                            | 로그인·시청 권한        | [src/modules/courses/lectures.routes.js:67](../src/modules/courses/lectures.routes.js)  |
| POST   | `/api/courses/:courseId/lectures`                            | 관리자                  | [src/modules/courses/lectures.routes.js:82](../src/modules/courses/lectures.routes.js)  |
| PATCH  | `/api/courses/:courseId/lectures/:lectureId`                 | 관리자                  | [src/modules/courses/lectures.routes.js:118](../src/modules/courses/lectures.routes.js) |
| DELETE | `/api/courses/:courseId/lectures/:lectureId`                 | 관리자                  | [src/modules/courses/lectures.routes.js:161](../src/modules/courses/lectures.routes.js) |
| POST   | `/api/courses/:courseId/lectures/:lectureId/playback`        | 로그인·시청 권한        | [src/modules/courses/lectures.routes.js:170](../src/modules/courses/lectures.routes.js) |
| POST   | `/api/courses/:courseId/lectures/:lectureId/convert`         | 관리자                  | [src/modules/courses/lectures.routes.js:184](../src/modules/courses/lectures.routes.js) |
| GET    | `/api/courses/:courseId/lectures/:lectureId/hls/:key/:asset` | 로그인·시청 권한        | [src/modules/courses/lectures.routes.js:192](../src/modules/courses/lectures.routes.js) |
| GET    | `/api/courses/:courseId/lectures/:lectureId`                 | 로그인·시청 권한        | [src/modules/courses/lectures.routes.js:207](../src/modules/courses/lectures.routes.js) |
| GET    | `/api/courses`                                               | 로그인·시청 권한        | [src/modules/courses/routes.js:20](../src/modules/courses/routes.js)                    |
| POST   | `/api/courses`                                               | 관리자                  | [src/modules/courses/routes.js:34](../src/modules/courses/routes.js)                    |
| GET    | `/api/courses/:courseId`                                     | 로그인·시청 권한        | [src/modules/courses/routes.js:52](../src/modules/courses/routes.js)                    |
| PATCH  | `/api/courses/:courseId`                                     | 관리자                  | [src/modules/courses/routes.js:56](../src/modules/courses/routes.js)                    |
| DELETE | `/api/courses/:courseId`                                     | 관리자                  | [src/modules/courses/routes.js:78](../src/modules/courses/routes.js)                    |
| PATCH  | `/api/courses/:courseId/status`                              | 관리자                  | [src/modules/courses/routes.js:90](../src/modules/courses/routes.js)                    |
| GET    | `/api/info/qna`                                              | 로그인·비공개 접근 검사 | [src/modules/info/routes.js:16](../src/modules/info/routes.js)                          |
| POST   | `/api/info/qna`                                              | 로그인·비공개 접근 검사 | [src/modules/info/routes.js:24](../src/modules/info/routes.js)                          |
| GET    | `/api/info/qna/:questionId`                                  | 로그인·비공개 접근 검사 | [src/modules/info/routes.js:40](../src/modules/info/routes.js)                          |
| PATCH  | `/api/info/qna/:questionId`                                  | 작성자                  | [src/modules/info/routes.js:44](../src/modules/info/routes.js)                          |
| DELETE | `/api/info/qna/:questionId`                                  | 작성자·관리자           | [src/modules/info/routes.js:63](../src/modules/info/routes.js)                          |
| POST   | `/api/info/qna/:questionId/answer`                           | 관리자                  | [src/modules/info/routes.js:71](../src/modules/info/routes.js)                          |
| PATCH  | `/api/info/qna/:questionId/answer`                           | 관리자                  | [src/modules/info/routes.js:85](../src/modules/info/routes.js)                          |
| DELETE | `/api/info/qna/:questionId/answer`                           | 관리자                  | [src/modules/info/routes.js:96](../src/modules/info/routes.js)                          |
| GET    | `/api/info/settings`                                         | 공개                    | [src/modules/info/settings.routes.js:7](../src/modules/info/settings.routes.js)         |
| PATCH  | `/api/info/settings`                                         | 관리자                  | [src/modules/info/settings.routes.js:15](../src/modules/info/settings.routes.js)        |
| GET    | `/api/manager/users`                                         | 관리자                  | [src/modules/manager/routes.js:51](../src/modules/manager/routes.js)                    |
| GET    | `/api/manager/users/:userId`                                 | 관리자                  | [src/modules/manager/routes.js:54](../src/modules/manager/routes.js)                    |
| GET    | `/api/manager/users/:userId/role`                            | 관리자                  | [src/modules/manager/routes.js:57](../src/modules/manager/routes.js)                    |
| PATCH  | `/api/manager/users/:userId/role`                            | 관리자                  | [src/modules/manager/routes.js:62](../src/modules/manager/routes.js)                    |
| PATCH  | `/api/manager/users/:userId/status`                          | 관리자                  | [src/modules/manager/routes.js:69](../src/modules/manager/routes.js)                    |
| DELETE | `/api/manager/users/:userId`                                 | 관리자                  | [src/modules/manager/routes.js:76](../src/modules/manager/routes.js)                    |
| GET    | `/api/manager`                                               | 관리자                  | [src/modules/manager/routes.js:81](../src/modules/manager/routes.js)                    |
| POST   | `/api/manager`                                               | 관리자                  | [src/modules/manager/routes.js:84](../src/modules/manager/routes.js)                    |
| PATCH  | `/api/manager`                                               | 관리자                  | [src/modules/manager/routes.js:94](../src/modules/manager/routes.js)                    |
| DELETE | `/api/manager`                                               | 관리자                  | [src/modules/manager/routes.js:102](../src/modules/manager/routes.js)                   |
| GET    | `/api/manager/users/:userId/lectures`                        | 관리자                  | [src/modules/manager/routes.js:110](../src/modules/manager/routes.js)                   |
| POST   | `/api/manager/users/:userId/lectures`                        | 관리자                  | [src/modules/manager/routes.js:121](../src/modules/manager/routes.js)                   |
| DELETE | `/api/manager/users/:userId/lectures/:lectureId`             | 관리자                  | [src/modules/manager/routes.js:150](../src/modules/manager/routes.js)                   |
| GET    | `/api/user`                                                  | 로그인·본인             | [src/modules/user/routes.js:15](../src/modules/user/routes.js)                          |
| PATCH  | `/api/user`                                                  | 로그인·본인             | [src/modules/user/routes.js:17](../src/modules/user/routes.js)                          |

## 강의 재생

POST .../:lectureId/playback은 `{lecture, format, playbackUrl}`을 응답한다. format은 hls 또는 original이다. HLS 주소는 `/api/courses/:courseId/lectures/:lectureId/hls/:key/index.m3u8`이며 재생 목록의 상대 segment 주소도 같은 라우터에서 권한을 검사한다.

GET .../:lectureId는 원본 바이트를 응답하고 Range 요청은 206, 잘못된 범위는 416이다. ?info=1은 공개 강의 메타데이터 JSON을 응답한다. HLS 변환 등록은 202, 중복 변환 요청은 409다.

## 주요 오류

401=로그인 필요/자격 불일치, 403=작업·시청 권한 없음, 404=대상·소속 없음, 409=중복·상태 충돌, 413=업로드 용량 초과, 416=잘못된 영상 바이트 범위, 503=카카오/SMTP 등 필수 외부 설정 미준비.

## 수정 시 확인

주소를 추가하면 app.js의 기능별 연결과 React 호출을 함께 확인한다. lectures는 courses 라우터에서 mergeParams:true로 부모 courseId를 받는다. API를 추가할 때 입력·허용/거절 조건과 Mocha 검사도 함께 정의한다.
