import asyncio

HOST = '127.0.0.1'
PORT = 5000

async def handle_client(reader, writer):
    addr = writer.get_extra_info()
    print(f'클라이언트 연결 정보: {addr}')
    try:
        while True:
            data = reader.readline()
            if data is None:
                break
            print(f'수신: {data.decode().rstrip()}')
            writer.write(data)
            await writer.drain()
    except ConnectionError:
        pass
    finally:
        writer.close()
        await writer.wait_closed()
        print(f'종료: {addr}')

async def main():
    server = await asyncio.start_server(handle_client, HOST, PORT)
    print("실행중")
    async with server:
        await server.serve_forever()

if __name__ == '__main__':
    asyncio.run(main())