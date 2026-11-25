import asyncio

async def tcp_echo_client(message):
    # 서버에 연결하고 메시지를 주고받는 코루틴
    # 서버에 연결 시도
    reader, writer = await asyncio.open_connection('127.0.0.1', 8888)
    
    addr = writer.get_extra_info('peername')
    print(f"서버 연결 완료: {addr}")
    
    print(f'전송: {message}')
    writer.write(message.encode())
    
    # 서버로부터 응답 받기
    data = await reader.read(100)
    print(f'수신: {data.decode()}')

    print('연결 종료')
    writer.close()
    await writer.wait_closed()

async def main():
    # 보낼 메시지
    await tcp_echo_client('안녕하세요, 비동기 에코 클라이언트입니다!')

if __name__ == '__main__':
    # 비동기 통신 준비
    asyncio.run(main())