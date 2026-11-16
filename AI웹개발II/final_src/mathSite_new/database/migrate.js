const { query } = require('../src/database');

// 기존 공유 DB의 행을 유지하면서 빠진 열만 추가한다. MySQL 5.7에서도 동작한다.
async function migrate() {
    const columns = [
        ['users', 'username', 'VARCHAR(40) UNIQUE'],
        ['lectures', 'video_status', "VARCHAR(20) NOT NULL DEFAULT 'NO_VIDEO'"],
        ['lectures', 'hls_key', 'CHAR(36)'],
        ['boards', 'popup_enabled', 'BOOLEAN NOT NULL DEFAULT FALSE'],
    ];
    for (const [table, column, definition] of columns) {
        const rows = await query(
            'SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?',
            [table, column],
        );
        if (!rows.length) await query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
    }
    await query(
        "UPDATE lectures SET video_status = 'ORIGINAL' WHERE video_file IS NOT NULL AND video_status = 'NO_VIDEO'",
    );
    await query('INSERT IGNORE INTO site_settings (id) VALUES (1)');
}

module.exports = { migrate };
