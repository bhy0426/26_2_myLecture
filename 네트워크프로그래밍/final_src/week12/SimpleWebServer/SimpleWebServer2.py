from http.server import BaseHTTPRequestHandler, HTTPServer
import urllib.parse as urlparse
import html

class myHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-type", "text/html; charset=utf-8")
        self.end_headers()

        body = """
<!DOCTYPE html>
<html>
  <head><title>python</title></head>
  <body>
    <h1>I am a web server!</h1>
    <form method='post'>
      <input type='text' name='course'>
      <input type='submit'>
    </form>
  </body>
</html>
"""
        self.wfile.write(body.encode("utf-8"))

    def do_POST(self):
        msg = html.escape(self.__get_post_parameter("course"))

        self.send_response(200)
        self.send_header("Content-type", "text/html; charset=utf-8")
        self.end_headers()

        body = f"""
<!DOCTYPE html>
<html>
  <head><title>python</title></head>
  <body>
    <h1>Response</h1>
    {msg}
  </body>
</html>
"""
        self.wfile.write(body.encode("utf-8"))

    def __get_post_parameter(self, key):
        length = int(self.headers.get('Content-Length', 0))
        data = self.rfile.read(length).decode('utf-8')
        params = urlparse.parse_qs(data)
        if key in params:
            return params[key][0]
        return 'test'

httpd = HTTPServer(('', 80), myHandler)
print("Web Server: running")
httpd.serve_forever()