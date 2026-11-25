import asyncio

HOST = '127.0.0.1'
PORT = 5000
SEP = ':'

clients = {}

async def send_line(writer, text):
    writer.write((text + '\n').encode())
    await writer.drain()

def find_id(writer):
    return next((cid for cid, w in list(clients.items()) if w is writer), None)

async def msg_proc(writer, line):
    if not line:
        return True
    code = line.split(SEP, 1)[0].upper()

    if code == 'ID':
            tokens = line.split(SEP, 1)
            if len(tokens) < 2 or not tokens[1]:
                await send_line(writer, 'Fail:Bad_Format')
            elif find_id(writer) is not None:
                await send_line(writer, 'Fail:Already_Reg')
            elif tokens[1] in clients:
                await send_line(writer, 'Fail:ID_Taken')
            else:
                print('reg id:', tokens[1])
                clients[tokens[1]] = writer
                await send_line(writer, 'Success:Reg_ID')
    
    elif code == 'TO':
        tokens = line.split(SEP, 3)                  # ['TO', from, to, msg]
        fromID = find_id(writer)                     # 메시지 속 ID 대신 연결에 등록된 ID 사용
        if len(tokens) < 4:
            await send_line(writer, 'Fail:Bad_Format')
        elif fromID is None:
            await send_line(writer, 'Fail:Need_ID')
        elif (to_writer := clients.get(tokens[2])) is None:
            await send_line(writer, 'Fail:No_Such_User')
        else:
            await send_line(to_writer, f'TO:{fromID}:{tokens[3]}')
            await send_line(writer, 'Success:1to1')

    elif code == 'BR':
        tokens = line.split(SEP, 2)                  # ['BR', from, msg]
        fromID = find_id(writer)
        if len(tokens) < 3:
            await send_line(writer, 'Fail:Bad_Format')
        elif fromID is None:
            await send_line(writer, 'Fail:Need_ID')
        else:
            for w in list(clients.values()):         # 순회 중 삭제 방지를 위해 복사
                if w is writer:
                    continue
                try:
                    await send_line(w, f'BR:{fromID}:{tokens[2]}')
                except ConnectionError:
                    pass                             # 한 명이 실패해도 나머지에게 계속 전송
            await send_line(writer, 'Success:BR')

    elif code == 'QUIT':
        tokens = line.split(SEP, 1)                  # ['QUIT', 'kim']
        if len(tokens) < 2 or not tokens[1]:
            await send_line(writer, 'Fail:Bad_Format')
        else:
            print('QUIT 요청:', tokens[1])
            return False

    else:
        await send_line(writer, 'Fail:Unknown_Command')

    return True

async def handle_client(reader, writer):
    addr = writer.get_extra_info('peername')
    print(f"연결 완료 : {addr}")
    try:
        while True:
            data = reader.readline()
            if not data:
                print('클라이언트와 연결 종료')
                break
            if await msg_proc(writer, data.encode().strip()) is False:
                break
    except Exception as e:
        print(f'클라이언트와 연결 종료(에러): {e}')
    finally:
        cid = find_id(writer)
        if cid is not None:
            clients.pop(cid, None)
            print(f'연결 종료: {cid}')
        writer.close()
        try:
            await writer.wait_closed()
        except Exception:
            pass

# 이미 async로 만들어진 함수를 호출할 때는 async로 함수를 정의해야 함

async def main():
    server = await asyncio.start_server(handle_client, HOST, PORT)
    print('Ctrl+C로 종료')
    async with server:
        await server.serve_forever()

if __name__ == '__main__':
    asyncio.run(main())