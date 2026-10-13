const express = require('express');
const dotenv = require('dotenv');

const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const path = require('path');
// nunjucks 모듈 불러오기
const nunjucks = require('nunjucks');

// info.js 불러오기
const infoRouter = require('./routes/info');


dotenv.config();

const app = express();
app.set('port', process.env.PORT || 3000);

// view engine을 html로 설정
app.set('view engine', 'html');
// nunjucks가 사용할 템플릿 폴더와 옵션 설정
// nunjucks 모듈을 사용할 폴더 views 등록
nunjucks.configure(path.join(__dirname, 'views'), {
    // nunjucks를 Express 앱에 연결
    express: app,
    // 템플릿 파일이 수정되면 변경 사항을 감지
    watch: true
});

app.use(
    // HTTP 요청 로그, dev = 개발용
    morgan('dev'),
    // public 폴더 안의 파일을 브라우저에서 접근할 수 있게 해주는 미들웨어
    express.static(path.join(__dirname, 'public')),
    // json 형식의 요청 body를 객체로 파싱   
    express.json(),
    express.urlencoded({ extended: false }),
    cookieParser(process.env.SECRET),
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

// /info 요청은 infoRouter에서 처리
app.use('/info', infoRouter);

app.use((req, res, next) => {
    next('Not found error!')
});

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send(err);
});

app.listen(app.get('port'), () => {
    console.log(app.get('port'), '번 포트에서 대기 중');
});
