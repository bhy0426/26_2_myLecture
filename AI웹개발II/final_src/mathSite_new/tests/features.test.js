const { describe, it, before, after } = require('mocha');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const net = require('node:net');
const { execFileSync } = require('node:child_process');
require('./database-env');
process.env.UPLOAD_DIR = path.resolve('.local/features-uploads');
process.env.RESET_MAIL_DIR = path.resolve('.local/features-mail');
process.env.SESSION_SECRET = crypto.randomBytes(32).toString('hex');
process.env.TEST_PASSWORD = crypto.randomBytes(24).toString('hex');
process.env.NGINX_RUNTIME_DIR = path.resolve('.local/nginx-features');
const { pool, query } = require('../src/database');
const { initialize } = require('./seed');
const { migrate } = require('../database/migrate');
const { waitForConversions } = require('../src/modules/courses/video');
const { client } = require('./http-client');
const app = require('../src/app');
let server, base, admin, student, viewer, courseId, studentId, lectureId, mediaUrl;
let nginxRunning = false;

async function login(request, email) {
    const response = await request('POST', '/auth/login', {
        email,
        password: process.env.TEST_PASSWORD,
    });
    assert.equal(response.status, 200);
    return response.json.user;
}

async function freePort() {
    const probe = net.createServer();
    await new Promise((resolve) => probe.listen(0, '127.0.0.1', resolve));
    const port = probe.address().port;
    await new Promise((resolve) => probe.close(resolve));
    return port;
}

describe('추가 기능과 FFmpeg·Nginx 통합', () => {
    before(async () => {
        assert.equal((await query('SELECT DATABASE() AS name'))[0].name, 'mathsite_test');
        await initialize();
        for (const table of [
            'kakao_accounts',
            'password_resets',
            'lecture_access',
            'questions',
            'boards',
            'lectures',
            'courses',
            'users',
            'roles',
        ])
            await query(`DELETE FROM ${table}`);
        await query("UPDATE site_settings SET channel_url = '' WHERE id = 1");
        await initialize();
        server = app.listen(0, '127.0.0.1');
        await new Promise((resolve) => server.once('listening', resolve));
        base = `http://127.0.0.1:${server.address().port}`;
        admin = client(() => base);
        student = client(() => base);
        viewer = client(() => base);
        await login(admin, 'admin@mathsite.local');
        studentId = (await login(student, 'student@mathsite.local')).id;
        await login(viewer, 'viewer@mathsite.local');
        courseId = (await query('SELECT id FROM courses ORDER BY id'))[0].id;
    });

    after(async () => {
        if (nginxRunning)
            execFileSync(process.execPath, ['scripts/nginx.js', 'stop'], {
                env: process.env,
                windowsHide: true,
            });
        await waitForConversions();
        if (server) {
            server.closeAllConnections();
            await new Promise((resolve) => server.close(resolve));
        }
        await pool.end();
        for (const name of ['features-uploads', 'features-mail']) {
            const target = path.resolve('.local', name);
            assert.equal(path.dirname(target), path.resolve('.local'));
            await fs.rm(target, { recursive: true, force: true });
        }
    });

    it('마이그레이션 반복 시 기존 회원·강좌 유지', async () => {
        const before = await query('SELECT id, email FROM users ORDER BY id');
        await migrate();
        await migrate();
        assert.deepEqual(await query('SELECT id, email FROM users ORDER BY id'), before);
    });

    it('문자열 아이디 가입·중복 거절·승인 후 아이디/이메일 로그인', async () => {
        const fresh = client(() => base);
        const body = {
            username: 'math_student',
            name: '신규 학생',
            email: 'id@mathsite.local',
            password: process.env.TEST_PASSWORD,
            role: 'admin',
        };
        const created = await fresh('POST', '/auth/register', body);
        assert.equal(created.status, 201);
        assert.equal(
            (
                await fresh('POST', '/auth/login', {
                    identifier: body.username,
                    password: body.password,
                })
            ).status,
            403,
        );
        assert.equal(
            (await fresh('POST', '/auth/register', { ...body, email: 'other@mathsite.local' }))
                .status,
            409,
        );
        await admin('PATCH', `/manager/users/${created.json.user.id}/status`, { status: 'active' });
        const logged = await fresh('POST', '/auth/login', {
            identifier: body.username,
            password: body.password,
        });
        assert.equal(logged.status, 200);
        assert.equal(logged.json.user.canManage, false);
        assert.equal(
            (
                await fresh('POST', '/auth/login', {
                    identifier: body.email,
                    password: body.password,
                })
            ).status,
            200,
        );
        assert.equal((await fresh('PATCH', '/user', { username: 'new_student' })).status, 200);
        assert.equal((await fresh('PATCH', '/user', { username: 'bad@id' })).status, 400);
    });

    it('회원 상세·역할 CRUD·회원 삭제는 관리자만 가능', async () => {
        const created = await admin('POST', '/manager', { code: 'trial', name: '체험 학생' });
        assert.equal(created.status, 201);
        const roleId = created.json.roleId;
        assert.equal(
            (await admin('PATCH', '/manager', { roleId, name: '수정한 역할' })).status,
            200,
        );
        const account = await client(() => base)('POST', '/auth/register', {
            name: '삭제 대상',
            email: 'remove@mathsite.local',
            password: process.env.TEST_PASSWORD,
        });
        const id = account.json.user.id;
        assert.equal((await admin('PATCH', `/manager/users/${id}/role`, { roleId })).status, 200);
        assert.equal(
            (await admin('GET', `/manager/users/${id}`)).json.user.roleName,
            '수정한 역할',
        );
        assert.equal((await student('DELETE', `/manager/users/${id}`)).status, 403);
        assert.equal((await admin('DELETE', '/manager', { roleId })).status, 409);
        assert.equal((await admin('DELETE', `/manager/users/${id}`)).status, 200);
        assert.equal((await admin('DELETE', '/manager', { roleId })).status, 200);
    });

    it('팝업 공지 조회·해제, 학생의 팝업 설정 거절', async () => {
        const created = await admin('POST', '/boards', {
            title: '팝업 공지',
            content: '알림 내용',
            popupEnabled: true,
            isPinned: true,
        });
        assert.equal(created.status, 201);
        const id = created.json.board.id;
        assert.equal((await student('GET', '/boards/popup')).json.board.id, id);
        assert.equal(
            (await student('PATCH', '/boards/' + id, { popupEnabled: false })).status,
            403,
        );
        await admin('PATCH', '/boards/' + id, { popupEnabled: false });
        assert.equal((await student('GET', '/boards/popup')).json.board, null);
    });

    it('채널 설정은 관리자만, 외부·스크립트 URL 거절', async () => {
        assert.equal((await student('PATCH', '/info/settings', { channelUrl: '' })).status, 403);
        for (const channelUrl of [
            'javascript:alert(1)',
            'https://example.com/abc',
            'https://pf.kakao.com.evil.test/x',
        ])
            assert.equal((await admin('PATCH', '/info/settings', { channelUrl })).status, 400);
        assert.equal(
            (await admin('PATCH', '/info/settings', { channelUrl: 'https://pf.kakao.com/_test' }))
                .status,
            200,
        );
        const publicSettings = await client(() => base)('GET', '/info/settings');
        assert.equal(publicSettings.json.channelUrl, 'https://pf.kakao.com/_test');
        assert.equal('mailConfigured' in publicSettings.json, false);
        await admin('PATCH', '/info/settings', { channelUrl: '' });
    });

    it('SMTP 미설정은 명확히 거절하고 파일 전달 모드는 토큰 비노출', async () => {
        const oldMode = process.env.MAIL_TRANSPORT;
        process.env.MAIL_TRANSPORT = 'smtp';
        delete process.env.SMTP_HOST;
        assert.equal(
            (await viewer('POST', '/auth/reset', { email: 'viewer@mathsite.local' })).status,
            503,
        );
        process.env.MAIL_TRANSPORT = oldMode;
        const result = await viewer('POST', '/auth/reset', { email: 'viewer@mathsite.local' });
        assert.equal(result.status, 200);
        const files = await fs.readdir(process.env.RESET_MAIL_DIR);
        const mail = JSON.parse(
            await fs.readFile(path.join(process.env.RESET_MAIL_DIR, files[0]), 'utf8'),
        );
        assert.ok(mail.url.includes('/reset?token='));
        assert.ok(!JSON.stringify(result.json).includes(mail.token));
    });

    it('SMTP 발송 함수의 TLS·메일 내용·수신자 구성 (외부 발송 없이)', async () => {
        const nodemailer = require('nodemailer');
        const original = nodemailer.createTransport;
        const previous = { ...process.env };
        let options, sent;
        nodemailer.createTransport = (config) => {
            options = config;
            return {
                sendMail: async (message) => {
                    sent = message;
                },
                close() {},
            };
        };
        try {
            Object.assign(process.env, {
                MAIL_TRANSPORT: 'smtp',
                SMTP_HOST: 'smtp.invalid',
                SMTP_PORT: '587',
                SMTP_SECURE: 'false',
                MAIL_FROM: 'sender@mathsite.local',
                APP_URL: 'https://mathsite.invalid',
            });
            await require('../src/modules/auth/mail').sendReset(
                'student@mathsite.local',
                'synthetic-reset-token',
            );
            assert.equal(options.requireTLS, true);
            assert.equal(sent.to, 'student@mathsite.local');
            assert.ok(
                sent.text.includes('https://mathsite.invalid/reset?token=synthetic-reset-token'),
            );
        } finally {
            nodemailer.createTransport = original;
            for (const key of Object.keys(process.env))
                if (!(key in previous)) delete process.env[key];
            Object.assign(process.env, previous);
        }
    });

    it('실제 FFmpeg HLS 변환·강의 제목 검색·학생별 권한', async () => {
        const fixture = await fs.readFile(path.join(__dirname, 'fixtures/sample.mp4'));
        const form = new FormData();
        form.set('title', 'HLS 변환 검사');
        form.set('video', new Blob([fixture], { type: 'video/mp4' }), 'sample.mp4');
        const created = await admin('POST', `/courses/${courseId}/lectures`, form);
        assert.equal(created.status, 201);
        lectureId = created.json.lecture.id;
        await waitForConversions();
        const [row] = await query('SELECT video_status, hls_key FROM lectures WHERE id = ?', [
            lectureId,
        ]);
        assert.equal(row.video_status, 'READY');
        await admin('POST', `/manager/users/${studentId}/lectures`, { lectureId });
        assert.equal(
            (await student('GET', `/courses/${courseId}/lectures?q=HLS`)).json.lectures.length,
            1,
        );
        const playback = await student(
            'POST',
            `/courses/${courseId}/lectures/${lectureId}/playback`,
        );
        assert.equal(playback.json.format, 'hls');
        mediaUrl = playback.json.playbackUrl.replace(/^\/api/, '');
        const playlist = await student('GET', mediaUrl);
        assert.equal(playlist.status, 200);
        assert.match(playlist.bytes.toString(), /#EXTM3U/);
        assert.equal((await viewer('GET', mediaUrl)).status, 403);
        const segment = playlist.bytes
            .toString()
            .split('\n')
            .find((line) => /^segment-/.test(line));
        assert.equal((await student('GET', mediaUrl.replace('index.m3u8', segment))).status, 200);
        assert.equal(
            (await student('GET', mediaUrl.replace('index.m3u8', 'private.txt'))).status,
            400,
        );
    });

    it('실제 Nginx 내부 파일 제공·직접 URL 차단·회수 후 조각 요청 차단', async () => {
        process.env.PORT = String(server.address().port);
        process.env.NGINX_PORT = String(await freePort());
        execFileSync(process.execPath, ['scripts/nginx.js', 'start'], {
            env: process.env,
            windowsHide: true,
        });
        nginxRunning = true;
        const proxyBase = `http://127.0.0.1:${process.env.NGINX_PORT}`;
        let ready = false;
        for (let i = 0; i < 40; i++) {
            try {
                if ((await fetch(proxyBase + '/health')).ok) {
                    ready = true;
                    break;
                }
            } catch {
                /* 초기 실행 대기 */
            }
            await new Promise((resolve) => setTimeout(resolve, 100));
        }
        assert.ok(ready, 'Nginx 시작');
        const request = client(() => proxyBase);
        await login(request, 'student@mathsite.local');
        const playlist = await request('GET', mediaUrl);
        assert.equal(playlist.status, 200);
        assert.match(playlist.headers.get('server'), /nginx/);
        assert.equal(playlist.headers.get('x-accel-redirect'), null);
        const segment = playlist.bytes
            .toString()
            .split('\n')
            .find((line) => /^segment-/.test(line));
        const segmentUrl = mediaUrl.replace('index.m3u8', segment);
        assert.equal((await request('GET', segmentUrl)).status, 200);
        const [row] = await query('SELECT hls_key FROM lectures WHERE id = ?', [lectureId]);
        assert.equal(
            (await fetch(proxyBase + `/_protected_media/${row.hls_key}/index.m3u8`)).status,
            404,
        );
        await admin('DELETE', `/manager/users/${studentId}/lectures/${lectureId}`);
        assert.equal((await request('GET', segmentUrl)).status, 403);
        assert.equal((await request('GET', mediaUrl)).status, 403);
    });
});
