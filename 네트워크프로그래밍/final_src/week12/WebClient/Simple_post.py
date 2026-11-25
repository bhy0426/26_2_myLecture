import urllib.request
#cmd 창에서 pip install aiohttp

req = urllib.request.Request("http://127.0.0.1/", method="POST")
with urllib.request.urlopen(req) as res:
    print(res.read().decode())