const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { describe, it, before, after, beforeEach } = require('mocha');
const nodemailer = require('nodemailer');
require('./database-env');
const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'mathsite-manager-mail-'));
process.env.MAIL_SETTINGS_FILE = path.join(directory, 'sender.json');
process.env.UPLOAD_DIR = path.join(directory, 'uploads');
process.env.TEST_PASSWORD = crypto.randomBytes(24).toString('hex');
process.env.SESSION_SECRET = crypto.randomBytes(32).toString('hex');
const { resetData } = require('./reset-data');
const { sequelize } = require('../src/models');
const app = require('../src/app');
const { client } = require('./http-client');
const { sendSignupCode, sendReset } = require('../src/modules/auth/mail');

describe('관리자의 발신 계정 변경', () => {
    const originalTransport = nodemailer.createTransport;
    const originalNow = Date.now;
    const gmail = { email: 'academy.example@gmail.com', appPassword: 'abcd efgh ijkl mnop' };
    const naver = { email: 'academy.example@naver.com', appPassword: 'navertestapp1234' };
    let server,
        admin,
        otherSession,
        student,
        guest,
        sent,
        offset = 0;

    before(async () => {
        await resetData();
        server = app.listen(0, '127.0.0.1');
        await new Promise((resolve) => server.once('listening', resolve));
        const base = () => 'http://127.0.0.1:' + server.address().port;
        [admin, otherSession, student, guest] = Array.from({ length: 4 }, () => client(base));
        for (const [request, username] of [
            [admin, 'admin'],
            [otherSession, 'admin'],
            [student, 'student'],
        ])
            assert.equal(
                (
                    await request('POST', '/auth/login', {
                        identifier: username,
                        password: process.env.TEST_PASSWORD,
                    })
                ).status,
                200,
            );
        Object.assign(process.env, {
            MAIL_TRANSPORT: 'smtp',
            SMTP_HOST: 'smtp.invalid',
            SMTP_USER: 'original@example.test',
            SMTP_PASSWORD: 'test-password',
            MAIL_FROM: 'original@example.test',
            APP_URL: 'http://127.0.0.1:3000',
        });
        Date.now = () => originalNow() + offset;
    });

    beforeEach(() => {
        offset += 11 * 60_000;
        process.env.MAIL_SETTINGS_FILE = path.join(directory, crypto.randomUUID() + '.json');
        sent = [];
        nodemailer.createTransport = (options) => ({
            sendMail: async (mail) => sent.push({ options, mail }),
            close() {},
        });
    });

    after(async () => {
        Date.now = originalNow;
        nodemailer.createTransport = originalTransport;
        if (server) {
            server.closeAllConnections();
            await new Promise((resolve) => server.close(resolve));
        }
        await sequelize.close();
        assert.equal(path.dirname(directory), os.tmpdir());
        fs.rmSync(directory, { recursive: true, force: true });
    });

    it('학생과 비로그인 요청은 발신 정보 조회·검증·변경을 할 수 없다', async () => {
        for (const [request, status] of [
            [student, 403],
            [guest, 401],
        ]) {
            for (const [method, url, body] of [
                ['GET', '/manager/mail'],
                ['POST', '/manager/mail/verification', gmail],
                ['POST', '/manager/mail/confirm', { code: '000000' }],
            ])
                assert.equal((await request(method, url, body)).status, status);
        }
        assert.equal(sent.length, 0);
    });

    it('새 Gmail의 코드가 확인될 때만 발신자를 교체하고 가입·초기화 메일에 함께 적용한다', async () => {
        const requested = await admin('POST', '/manager/mail/verification', gmail);
        assert.equal(requested.status, 200, requested.json?.message);
        const { verificationId } = requested.json;
        const { options, mail } = sent[0];
        assert.equal(options.host, 'smtp.gmail.com');
        assert.equal(options.auth.user, gmail.email);
        assert.equal(options.auth.pass, gmail.appPassword.replaceAll(' ', ''));
        assert.equal(options.requireTLS, true);
        assert.equal(mail.to, gmail.email);
        const code = mail.text.match(/\d{6}/)[0];
        assert.deepEqual(Object.keys(requested.json).sort(), [
            'email',
            'expiresAt',
            'message',
            'verificationId',
        ]);
        const current = (await admin('GET', '/manager/mail')).json;
        assert.equal(current.sender, process.env.MAIL_FROM);
        assert.equal(current.pending.verificationId, verificationId);
        assert.equal((await otherSession('GET', '/manager/mail')).json.pending, null);
        assert.equal(
            (await otherSession('POST', '/manager/mail/confirm', { verificationId, code })).status,
            400,
        );
        await sendSignupCode('first@example.test', '000000');
        assert.equal(sent.at(-1).mail.from, process.env.MAIL_FROM);
        const confirmed = await admin('POST', '/manager/mail/confirm', { verificationId, code });
        assert.equal(confirmed.status, 200);
        assert.equal(confirmed.json.sender, gmail.email);
        assert.equal(confirmed.json.pending, null);
        assert.ok(confirmed.json.verifiedAt);
        assert.ok(!confirmed.bytes.includes(Buffer.from(options.auth.pass)));
        assert.ok(
            !fs.readFileSync(process.env.MAIL_SETTINGS_FILE, 'utf8').includes(options.auth.pass),
        );
        // 이 프로세스의 캐시 없이, 저장된 암호문만 옮겨도 같은 발신 계정을 읽어야 한다.
        const restored = path.join(directory, 'restored.json');
        fs.copyFileSync(process.env.MAIL_SETTINGS_FILE, restored);
        process.env.MAIL_SETTINGS_FILE = restored;
        assert.equal((await otherSession('GET', '/manager/mail')).json.source, 'manager');
        assert.equal(
            (await admin('POST', '/manager/mail/confirm', { verificationId, code })).status,
            400,
        );
        await sendSignupCode('second@example.test', '000000');
        await sendReset('third@example.test', 'test-token');
        assert.deepEqual(
            sent.slice(-2).map((item) => item.mail.from),
            [gmail.email, gmail.email],
        );
    });

    it('네이버는 지정된 SMTP를 쓰고 오래된 요청·만료 코드·5회 오입력은 적용되지 않는다', async () => {
        const start = () => admin('POST', '/manager/mail/verification', naver);
        const first = await start();
        assert.equal(first.status, 200);
        assert.equal(sent[0].options.host, 'smtp.naver.com');
        assert.equal(sent[0].options.port, 587);
        assert.equal(sent[0].options.requireTLS, true);
        assert.equal((await start()).status, 429);
        offset += 61_000;
        const second = await start();
        assert.equal(second.status, 200);
        const code = sent[1].mail.text.match(/\d{6}/)[0];
        assert.equal(
            (
                await admin('POST', '/manager/mail/confirm', {
                    verificationId: first.json.verificationId,
                    code,
                })
            ).status,
            400,
        );
        const wrong = code === '000000' ? '000001' : '000000';
        for (let i = 1; i <= 5; i++)
            assert.equal(
                (
                    await admin('POST', '/manager/mail/confirm', {
                        verificationId: second.json.verificationId,
                        code: wrong,
                    })
                ).status,
                i === 5 ? 429 : 400,
            );
        offset += 61_000;
        const third = await start();
        offset += 10 * 60_000;
        assert.equal(
            (
                await admin('POST', '/manager/mail/confirm', {
                    verificationId: third.json.verificationId,
                    code: sent[2].mail.text.match(/\d{6}/)[0],
                })
            ).status,
            400,
        );
        assert.equal((await admin('GET', '/manager/mail')).json.source, 'environment');
    });

    it('인증 실패와 허용하지 않은 주소는 기존 발신 계정을 바꾸지 않는다', async () => {
        assert.equal(
            (
                await admin('POST', '/manager/mail/verification', {
                    ...gmail,
                    email: 'test@example.test',
                })
            ).status,
            400,
        );
        nodemailer.createTransport = () => ({
            sendMail: async () => {
                throw new Error('synthetic SMTP failure');
            },
            close() {},
        });
        assert.equal((await admin('POST', '/manager/mail/verification', gmail)).status, 502);
        const current = (await admin('GET', '/manager/mail')).json;
        assert.equal(current.source, 'environment');
        assert.equal(current.pending, null);
    });

    it('발신 설정이 손상돼도 로그인 항목은 읽을 수 있고 관리자는 새 계정으로 복구한다', async () => {
        fs.writeFileSync(process.env.MAIL_SETTINGS_FILE, 'invalid credential file');
        const status = await admin('GET', '/manager/mail');
        assert.equal(status.status, 200);
        assert.equal(status.json.source, 'none');
        assert.match(status.json.warning, /다시 등록/);
        const fields = await guest('GET', '/auth/status');
        assert.equal(fields.status, 200);
        await assert.rejects(sendSignupCode('test@example.test', '000000'), { status: 503 });
        assert.equal(sent.length, 0);
        const request = await admin('POST', '/manager/mail/verification', naver);
        assert.equal(request.status, 200);
        const code = sent[0].mail.text.match(/\d{6}/)[0];
        const result = await admin('POST', '/manager/mail/confirm', {
            verificationId: request.json.verificationId,
            code,
        });
        assert.equal(result.status, 200);
        assert.equal(result.json.sender, naver.email);
        assert.equal(result.json.warning, null);
    });
});
