const app = require('./app');
const http = require('node:http');
const { query } = require('./database');
const { configureFrontend } = require('./frontend');
const port = Number(process.env.PORT) || 3000;

query('SELECT 1')
    .then(async () => {
        const server = http.createServer(app);
        await configureFrontend(server, process.argv.includes('--dev'));
        server.listen(port, '127.0.0.1', () =>
            console.log(`MathSite: http://localhost:${port} (MySQL 연결 완료)`),
        );
    })
    .catch((error) => {
        console.error(
            '서버 시작 실패: DB 연결과 프론트 설정을 확인하세요.',
            error.code || error.name,
        );
        process.exitCode = 1;
    });
