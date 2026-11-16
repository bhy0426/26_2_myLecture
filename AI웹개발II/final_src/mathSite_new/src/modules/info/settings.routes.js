const express = require('express');
const { query } = require('../../database');
const { requireAdmin, fail } = require('../../shared/helpers');
const { mailConfigured } = require('../auth/mail');
const router = express.Router();

router.get('/', async (req, res) => {
    const [settings] = await query('SELECT channel_url FROM site_settings WHERE id = 1');
    res.json({
        channelUrl: settings?.channel_url || '',
        ...(req.user?.canManage ? { mailConfigured: mailConfigured() } : {}),
    });
});

router.patch('/', requireAdmin, async (req, res) => {
    const channel = typeof req.body.channelUrl === 'string' ? req.body.channelUrl.trim() : '';
    if (channel) {
        let url;
        try {
            url = new URL(channel);
        } catch {
            fail(400, '카카오 채널 주소를 확인하세요.');
        }
        if (
            url.protocol !== 'https:' ||
            url.hostname !== 'pf.kakao.com' ||
            url.username ||
            url.password ||
            !/^\/[a-zA-Z0-9_]+(?:\/chat)?$/.test(url.pathname) ||
            url.search ||
            url.hash
        )
            fail(400, 'https://pf.kakao.com/채널ID 형식으로 입력하세요.');
    }
    await query('UPDATE site_settings SET channel_url = ? WHERE id = 1', [channel]);
    res.json({ message: '채널 설정 저장 완료' });
});

module.exports = router;
