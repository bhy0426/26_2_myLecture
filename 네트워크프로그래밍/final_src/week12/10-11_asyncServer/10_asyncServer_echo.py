# 비동기 에코 서버
import asyncio

HOST = '127.0.0.1'
PORT = 5000

# reader는 수동적
# writer는 능동적, 상대방의 정보, close 등은 writer로 해야 함
async def handle_client(reader, writer):
    # 클라이언트의 주소를 반환
    addr = writer.get_extra_info('peername')
    print('연결:', addr)
    try:
        # 무한 루프, 지속적으로 태스크 유지
        while True:
            # await, 입력을 대기하면서 다른 작업에 제어권 양보
            data = await reader.readline()       # '\n'까지 한 줄 올 때까지 대기
            if not data:                         # 클라이언트가 연결을 닫음
                break
            print('수신:', data.decode().rstrip())  # right 여백 strip
            # 두 개는 세트
            writer.write(data)                   # 받은 그대로 돌려줌
            await writer.drain()                 # 전송 버퍼가 비워질 때까지 대기
    except ConnectionError:
        pass
    finally:
        # reader.close()는 정의 안됨
        # 두 개도 세트
        writer.close()
        await writer.wait_closed() # 닫히는 것을 기다림
        print('종료:', addr)

async def main():
    # await를 사용하여 클라이언트의 접속을 기다리면서 다른 작업을 수행
    # asyncio.start_server(핸들러(접속 시 태스크로 발생), 주소, 포트)
    # 비동기식의 반환값은 reader, writer
    server = await asyncio.start_server(handle_client, HOST, PORT)
    print('대기 (Ctrl+C로 종료)')
    async with server:
        await server.serve_forever()

if __name__ == '__main__':
    try:
        asyncio.run(main()) # 비동기 통신 준비
    except KeyboardInterrupt:
        print('\n서버 종료')