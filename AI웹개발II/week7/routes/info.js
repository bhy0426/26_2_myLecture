const express = require('express');
const bcrypt = require('bcrypt');

const router = express.Router();

// /info/message 경로라는 것을 헷갈리지 않기
router.post('/message', (req, res) => {
    // 템플릿 엔진으로 html을 사용하기 때문에 render 호출
    // view 폴더에 있는 info.html에 객체를 전달
    res.render("info", {
        title: 'Info-Message',
        // index.html에서 key로 msg를 전달
        message: req.body.msg
    });
});

router.get('/:id', (req, res) => {
    res.render("info", {
        title: 'Info-ID',
        message: req.params.id
    });
});

router.post('/password', async (req, res) => {
    // hash 함수를 12번 반복
    // async, await 비동기 처리
    global.password = await bcrypt.hash(req.body.password, 12);
    res.render("info", {
        title: 'Encrypted',
        message: global.password
    });
});

router.post('/compare', async (req, res) => {
    // compare 함수가 평문을 암호화해서 global.password와 비교
    const auth = await bcrypt.compare(req.body.password, global.password);
    res.render("info", {
        title: 'Auth',
        message: auth
    });
});

module.exports = router;
