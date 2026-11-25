import asyncio

HOST = '127.0.0.1'
PORT = 5000
SEP = ':'

async def send(writer, *fields):
    # 필드들을 SEP로 이어 붙이고 끝에 \\n을 붙여 전송
    writer.write((SEP.join(fields) + '\n').encode())
    await writer.drain()

async def receiver(reader):
    # 서버에서 온 줄을 그대로 출력한다.
    while True:
        data = await reader.readline()
        if not data:
            print('\n서버와 연결이 끊어졌습니다.')
            return
        print(data.decode().rstrip())

async def sender(writer, myID):
    # 키보드 입력을 프로토콜에 맞춰 서버로 전송한다.
    # 현재 실행 중인 이벤트 루프를 가져온다.
    loop = asyncio.get_running_loop()
    while True:
        # Enter를 기다리는 input()은 별도 스레드에서 실행한다.
        # sender가 입력 결과를 기다리는 동안 receiver는 메시지를 받을 수 있다.
        msg = await loop.run_in_executor(None, input)    # 블로킹 input을 스레드에 맡김
        if msg in ('Q', 'q'):
            await send(writer, 'QUIT', myID)             # QUIT:kim
            return
        elif msg.startswith('@'):
            toID, _, text = msg[1:].partition(' ')
            if not toID or not text:
                print('형식: @상대ID 메시지')
                continue
            await send(writer, 'TO', myID, toID, text)   # TO:kim:lee:점심 먹자
        elif msg:
            await send(writer, 'BR', myID, msg)          # BR:kim:안녕하세요

async def main():
    myID = input('내 ID 입력: ').strip()                  # 태스크 시작 전이라 그냥 input 사용 가능
    while not myID or SEP in myID:
        myID = input(f'ID는 비어 있거나 "{SEP}"를 포함할 수 없습니다. 다시 입력: ').strip()

    try:
        reader, writer = await asyncio.open_connection(HOST, PORT)
    except OSError:
        print('연결 실패')
        return
    print('연결 성공')

    await send(writer, 'ID', myID)                       # ID:kim

    print('사용법: 그냥 입력=전체 전송 / @상대ID 메시지=1:1 전송 / Q=종료')

    t1 = asyncio.create_task(receiver(reader)) # 태스크로 등록
    t2 = asyncio.create_task(sender(writer, myID))

    # 둘 중 하나라도 끝나면 나머지를 취소
    # pending은 대기 중인 태스크를 의미
    # 하나라도 종료되면 대기 중인 나머지 태스크를 종료
    done, pending = await asyncio.wait({t1, t2}, return_when=asyncio.FIRST_COMPLETED)
    for t in pending:
        t.cancel()

    writer.close()
    try:
        await writer.wait_closed()
    except Exception:
        pass
    print('종료')

if __name__ == '__main__':
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print('\n종료')