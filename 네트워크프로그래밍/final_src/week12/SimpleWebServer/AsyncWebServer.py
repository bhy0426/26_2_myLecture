from aiohttp import web
import time

async def get_handler(request):
    body = "<html><body><h1>It's my Async Server!</h1><div>gg</div></body></html>"
    return web.Response(text=body, content_type="text/html")

async def post_handler(request):
    date = time.strftime("%Y-%m-%d %H:%M:%S")
    return web.Response(text="time: " + date, content_type="application/json")

app = web.Application()
app.add_routes([
    web.get("/", get_handler),
    web.post("/", post_handler),
])

if __name__ == "__main__":
    print("Web Server: running")
    web.run_app(app, port=80)