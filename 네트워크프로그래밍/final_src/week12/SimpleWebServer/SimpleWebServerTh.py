from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import time

class myHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-type", "text/html; charset=utf-8")
        self.end_headers()
        body = "<html><body><h1>It's my Server!</h1></body></html>"
        self.wfile.write(body.encode("utf-8"))

    def do_POST(self):
        self.send_response(200)
        self.send_header("Content-type", "application/json")
        self.end_headers()
        date = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
        self.wfile.write(('time: ' + date).encode())

if __name__ == "__main__":
    # 두 번째 인자는 반드시 핸들러 클래스(myHandler)
    httpd = ThreadingHTTPServer(('', 80), myHandler)
    print("Web Server: running")
    httpd.serve_forever()
