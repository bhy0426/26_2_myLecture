const dotenv = require('dotenv');

const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const path = require('path');
const fs = require('fs');

// https://github.com/expressjs/multer
const multer = require('multer');


dotenv.config();

const PUBLIC = path.join(__dirname, 'public');

const app = express();
app.set('port', process.env.PORT || 5000);

app.use(
    morgan('dev'),
    express.static(PUBLIC),
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
    }));


// '/' 경로는 index.html로 응답
app.get('/', (_, res) => res.sendFile(path.join(PUBLIC, 'index.html')));
// '/upload' 경로는 upload.html로 응답
app.get('/upload', (_, res) => res.sendFile(path.join(PUBLIC, 'upload.html')));
app.get('/uploads1', (_, res) => res.sendFile(path.join(PUBLIC, 'uploads1.html')));
app.get('/uploads2', (_, res) => res.sendFile(path.join(PUBLIC, 'uploads2.html')));

// 업로드된 파일을 저장할 경로
const DIR = 'data/'

// readdirSync(), 해당 경로를 읽고 기다리고 경로가 없으면 data 폴더를 생성
try {
    fs.readdirSync(DIR);
} catch (error) {
    fs.mkdirSync(DIR);
}

// multer
// 생성자 함수 인자로 객체 전달
// storage는 저장할 경로 설정
// destination 목적지
// filename 저장될 파일명
// file 전달받은 파일 객체
const upload = multer({
    storage: multer.diskStorage({
        destination(req, file, done) {
            done(null, DIR);
        },
        filename(req, file, done) {
            done(null, file.originalname);
        }
    })
});

/*
.single(fieldname)
- fieldname 인자에 명시된 이름의 단수 파일을 전달
*/
// 'file'은 POST로 전달된 input 데이터의 키
app.post('/upload', upload.single('file'), (req, res) => {
    const { id } = req.body;
    console.log(id);    
    res.send(req.file);
});

/*
.array(fieldname[, maxCount])
fieldname 인자에 명시된 이름의 파일 전부를 배열 형태로 전달 
선택적으로 maxCount 에 명시된 값 이상의 파일이 업로드 될 경우 에러를 출력
*/
app.post('/uploads1', (req, res, next) => {
    upload.array('files', 3)(req, res, next);
}, (req, res) => res.send(req.files));

/*
.fields(fields)
fields 인자에 명시된 여러 파일을 전달
fields는 name 과 maxCount (선택사항) 을 포함하는 객체의 배열
*/
app.post('/uploads2', (req, res, next) => {
    multer({
        storage: multer.diskStorage({
            destination(req, file, done) {
                done(null, DIR);
            }
        })
    }).fields( [{ name: 'files1', maxCount: 1 }, { name: 'files2', maxCount: 2 }] )(req, res, next);
}, (req, res) => res.send(req.files));

app.listen(app.get('port'), () => console.log(`${app.get('port')} 번 포트에서 대기 중`));
