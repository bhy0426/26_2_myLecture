const nodemailer = require('nodemailer');
const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');
const { fail } = require('../../shared/helpers');

function mailConfigured() {
    return Boolean(process.env.SMTP_HOST && process.env.MAIL_FROM && process.env.APP_URL);
}

function requireMail() {
    if (process.env.MAIL_TRANSPORT !== 'file' && !mailConfigured())
        fail(503, '비밀번호 재설정 메일이 아직 준비되지 않았습니다. 관리자에게 문의하세요.');
}

async function sendReset(email, token) {
    requireMail();
    const base = new URL(process.env.APP_URL || 'http://127.0.0.1:3000');
    if (!['http:', 'https:'].includes(base.protocol)) fail(500, '사이트 주소 설정을 확인하세요.');
    const url = new URL('/reset', base);
    url.searchParams.set('token', token);
    if (process.env.MAIL_TRANSPORT === 'file') {
        const directory = path.resolve(process.env.RESET_MAIL_DIR || '.local/reset-mail');
        await fs.mkdir(directory, { recursive: true });
        await fs.writeFile(
            path.join(directory, `${crypto.randomUUID()}.json`),
            JSON.stringify({ email, token, url: url.href }),
        );
        return;
    }
    const transport = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        requireTLS: process.env.SMTP_SECURE !== 'true',
        ...(process.env.SMTP_USER
            ? { auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } }
            : {}),
        connectionTimeout: 10000,
        socketTimeout: 10000,
        disableFileAccess: true,
        disableUrlAccess: true,
    });
    try {
        await transport.sendMail({
            from: process.env.MAIL_FROM,
            to: email,
            subject: 'MathSite 비밀번호 재설정',
            text: `30분 안에 다음 주소에서 비밀번호를 변경하세요.\n${url.href}\n요청하지 않았다면 무시하세요.`,
        });
    } catch {
        fail(502, '메일 발송에 실패했습니다. 잠시 후 다시 시도하세요.');
    } finally {
        transport.close();
    }
}

module.exports = { sendReset, requireMail, mailConfigured };
