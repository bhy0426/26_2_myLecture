// 모듈 불러오기
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const path = require('path');

// .env(환경변수, 비밀번호 등을 저장)
// config 함수를 호출하면 process.env에 .env 내용을 그대로 추가
// process.env = { .env의 내용 };
dotenv.config();

// express 객체 생성
const app = express();
// 포트를 5000으로 설정
app.set('port', process.env.PORT || 3000);

app.set('view engine', 'html');

// 경로가 지정되지 않았으므로 모든 요청에 대해 실행됨
app.use(
    // 모든 함수의 리턴값은 미들웨어 함수
    morgan('dev'),
    // 모든 요청에 대해서 public 폴더에서 접근
    express.static(path.join(__dirname, 'public')),
    express.json(),
    // 복호화
    express.urlencoded({ extended: false }),
    // 쿠키 파싱
    // req.cookies 속성 추가
    cookieParser(process.env.SECRET),
    // session 미들웨어
    // 세션이 쿠키를 관리함
    // secret 비밀번호와 cookie의 비밀번호가 같아야 함
    // 쿠키 -> 세션, 미들웨어 순서가 바뀌면 안됨
    session({
        resave: false,
        saveUninitialized: false,
        secret: process.env.SECRET,
        cookie: {
            httpOnly: true,
            secure: false
        },
        name: 'session-cookie'
    })
);

// GET, /error
// next에 인자를 전달하므로 78번째 줄의 에러 처리 미들웨어로 이동
app.get('/error', (req, res, next) => {
    next('일부러 만든 에러');
});

// input의 msg 키를 가져옴
// POST, /info/message
app.post('/info/message', (req, res, next) => {
    const msg = `Info-Message: ${   .msg}`;
    console.log(msg);
    res.send(msg);
});

// GET, /info/:id
// id는 parameter path, 랜덤한 값이 들어올 수 있음
// parameter path 메소드는 항상 마지막에 작성해야 함
// /info/message 보다 위에 작성하면 항상 id로만 출력됨
app.get('/info/:id', (req, res, next) => {
    const msg = `Info-ID: ${req.params.id}`;
    console.log(msg);
    res.send(msg);
});

// 잘못된 경로를 입력하면 에러 처리 미들웨어로 이동
app.use((req, res, next) => {
    next('Not found error!');
});

// 상단의 미들웨어에서 에러 처리 미들웨어로 이동하기 때문에 이 미들웨어는 절대 출력될 수 없음
app.use((req, res, next) => {
    console.log('절대 출력될 수 없는 문자열');
    next();
});

// 에러 처리 미들웨어
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send(err);
});

app.listen(app.get('port'), () => {
    console.log(app.get('port'), '번 포트에서 대기 중');
});
