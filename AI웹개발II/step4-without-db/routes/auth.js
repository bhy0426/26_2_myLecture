const express = require('express');
const passport = require('passport');

const { logout } = require('./helpers');


const router = express.Router();

router.post('/login', (req, res, next) => {
    // local 로그인 전략
    passport.authenticate('local', (authError, user, info) => {
        if (user) req.login(user, loginError => res.redirect('/'));
        else next(info);
    })(req, res, next);
});

router.get('/logout', logout);

module.exports = router;
