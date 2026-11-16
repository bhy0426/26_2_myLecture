const nodemailer = require('nodemailer');
const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');
const { fail } = require('../../shared/helpers');
const { readSender } = require('../manager/mail-sender.store');

function environmentConfigured() {
    const { SMTP_HOST, SMTP_USER, SMTP_PASSWORD, MAIL_FROM, APP_URL } = process.env;
    if (!SMTP_HOST || !MAIL_FROM || !APP_URL) return false;
    if (SMTP_HOST.toLowerCase() === 'smtp.gmail.com') return Boolean(SMTP_USER && SMTP_PASSWORD);
    return Boolean(SMTP_USER) === Boolean(SMTP_PASSWORD);
}

function mailConfigured() {
    try {
        return Boolean(readSender()) || environmentConfigured();
    } catch (error) {
        if (error.status === 503) return false;
        throw error;
    }
}

function smtpSettings(sender) {
    if (sender) {
        return {
            host: sender.email.endsWith('@naver.com') ? 'smtp.naver.com' : 'smtp.gmail.com',
            port: 587,
            secure: false,
            user: sender.email,
            pass: sender.appPassword,
            from: sender.email,
        };
    }
    return {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
        from: process.env.MAIL_FROM,
    };
}

function canSendResetEmail() {
    if (process.env.MAIL_TRANSPORT === 'file')
        return (
            process.env.DB_NAME === 'mathsite_test' &&
            ['localhost', '127.0.0.1'].includes(process.env.DB_HOST)
        );
    return mailConfigured();
}

function requireMail(purpose = '비밀번호 재설정') {
    if (!canSendResetEmail())
        fail(503, `${purpose} 메일이 아직 준비되지 않았습니다. 관리자에게 문의하세요.`);
}

async function sendReset(email, token) {
    requireMail();
    const base = new URL(process.env.APP_URL || 'http://127.0.0.1:3000');
    if (!['http:', 'https:'].includes(base.protocol)) fail(500, '사이트 주소 설정을 확인하세요.');
    const url = new URL('/reset', base);
    url.searchParams.set('token', token);
    return deliver(
        email,
        'MathSite 비밀번호 재설정',
        `관리자가 기존 비밀번호와 로그인 상태를 초기화했습니다. 30분 안에 다음 주소에서 새 비밀번호를 설정하세요.\n${url.href}\n초기화 사유를 모르면 관리자에게 문의하세요.`,
        process.env.RESET_MAIL_DIR || '.local/reset-mail',
        { email, token, url: url.href },
    );
}

async function sendSignupCode(email, code) {
    requireMail('회원가입 인증');
    return deliver(
        email,
        'MathSite 회원가입 인증코드',
        `회원가입 인증코드는 ${code}입니다. 10분 안에 가입을 신청한 화면에 입력하세요.`,
        process.env.SIGNUP_MAIL_DIR || '.local/signup-mail',
        { email, code },
    );
}

async function sendSenderCode(sender, code) {
    return deliver(
        sender.email,
        'MathSite 발신 주소 등록',
        `발신 주소를 등록하려면 10분 안에 관리자 화면에 인증코드 ${code}를 입력하세요.`,
        process.env.SIGNUP_MAIL_DIR || '.local/test-sender-mail',
        { email: sender.email, code },
        sender,
    );
}

async function deliver(email, subject, text, testDirectory, testMessage, candidate) {
    if (process.env.MAIL_TRANSPORT === 'file') {
        if (!canSendResetEmail()) fail(503, '메일 전송 설정을 확인하세요.');
        await fs.mkdir(testDirectory, { recursive: true });
        await fs.writeFile(
            path.join(testDirectory, `${crypto.randomUUID()}.json`),
            JSON.stringify(testMessage),
        );
        return;
    }
    const settings = smtpSettings(candidate || readSender());
    const transport = nodemailer.createTransport({
        host: settings.host,
        port: settings.port,
        secure: settings.secure,
        requireTLS: !settings.secure,
        ...(settings.user ? { auth: { user: settings.user, pass: settings.pass } } : {}),
        connectionTimeout: 10000,
        socketTimeout: 10000,
        disableFileAccess: true,
        disableUrlAccess: true,
    });
    try {
        await transport.sendMail({
            from: settings.from,
            to: email,
            subject,
            text,
        });
    } catch {
        if (candidate)
            fail(
                502,
                '확인 메일을 보내지 못했습니다. 메일 제공자의 2단계 인증·앱 비밀번호·SMTP 설정을 확인하세요.',
            );
        fail(502, '메일 발송에 실패했습니다. 잠시 후 다시 시도하세요.');
    } finally {
        transport.close();
    }
}

module.exports = {
    sendReset,
    sendSignupCode,
    sendSenderCode,
    requireMail,
    environmentConfigured,
    mailConfigured,
    canSendResetEmail,
};
