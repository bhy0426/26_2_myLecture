const express = require('express');
const bcrypt = require('bcrypt')
const User = require('../models/user');

const router = express.Router();


router.route('/')
    .get(async (req, res, next) => {
        try {
            // db 작업은 async await 사용
            // 모든 행 중 'id' 컬럼만 조회
            const users = await User.findAll({
                attributes: ['id']
            });

            // user 객체 배열을 user.id 배열로 바꾸어 전달
            res.render('user', {
                title: require('../package.json').name,
                port: process.env.PORT,
                users: users.map(user => user.id)
            });
        } catch (err) {
            console.error(err);
            next(err);
        }
    })
    .post(async (req, res, next) => {
        // body의 키를 구조 분해 할당을 가져옴
        const { id, password, name, description } = req.body;

        // findOne 하나만 찾음
        // id 키의 id 값
        const user = await User.findOne({ where: { id } });
        if (user) {
            next('이미 등록된 사용자 아이디입니다.');
            return;
        }

        try {
            // bcrypt 암호화
            const hash = await bcrypt.hash(password, 12);
            await User.create({
                id,
                password: hash,
                name,
                description
            });

            res.redirect('/');
        } catch (err) {
            console.error(err);
            next(err);
        }
    });

router.post('/update', async (req, res, next) => {
    try {
        // description만 수정
        const result = await User.update({
            description: req.body.description
        }, {
            where: { id: req.body.id }
        });

        if (result) res.redirect('/');
        else next(`There is no user with ${req.params.id}.`);
    } catch (err) {
        console.error(err);
        next(err);
    }
});

// get메소드, 파라미터 사용
router.get('/delete/:id', async (req, res, next) => {
    try {
        const result = await User.destroy({
            where: { id: req.params.id }
        });

        if (result) res.redirect('/');
        else next(`There is no user with ${req.params.id}.`);
    } catch (err) {
        console.error(err);
        next(err);
    }
});

// 파라미터 변수의 comments로 접근
router.get('/:id/comments', async (req, res, next) => {
    try {
        const user = await User.findOne({
            where: { id: req.params.id }
        });

        // getComment는 유저의 모든 comments를 가져옴
        const comments = await user.getComments();
        if (user) res.json(comments);
        else next(`There is no user with ${req.params.id}.`);
    } catch (err) {
        console.error(err);
        next(err);
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        const user = await User.findOne({
            where: { id: req.params.id },
            attributes: ['id', 'name', 'description']
        });

        if (user) res.json(user);
        else next(`There is no user with ${req.params.id}.`);
    } catch (err) {
        console.error(err);
        next(err);
    }
});

module.exports = router;
