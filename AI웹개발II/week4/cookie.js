const http = require("http");

const server = http.createServer((req, res) => {
    res.writeHead(200, {'Set-Cookie' : 'myCookie=test'});
    res.end('Hello Cookie');
});

server.listen(8003);