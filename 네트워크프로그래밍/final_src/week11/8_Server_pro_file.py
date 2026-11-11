# server_thread dictionary exit
# 
from socket import *
from threading import Thread

HOST = ''
PORT = 5000
BUFSIZE = 1024
ADDR = (HOST, PORT)
SEP = ':'

clientSockets = {}      # {client ID: client 소켓}


def send_line(s, text):
    s.sendall((text + '\n').encode())


def find_id(cs):
    return next((cid for cid, s in list(clientSockets.items()) if s is cs), None)


def remove_client(cs):
    cid = find_id(cs)
    if cid is not None:
        clientSockets.pop(cid, None)
        print('Disconnected:', cid)
    try:
        cs.close()
    except OSError:
        pass

# 파일 전송 처리
def handle_file(cs, buf, header):
    #FILE 헤더를 처리하고 본문을 수신자에게 중계한다. 파일 뒤에 남은 데이터를 반환.
    try:
        _, _, toID, rest = header.split(SEP, 3)          # ['FILE', from, to, 'filename:size']
        filename, _, size_text = rest.rpartition(SEP)
        size = int(size_text)
        if size < 0 or not filename:
            raise ValueError
    except ValueError:
        send_line(cs, 'Fail:Bad_Format')
        raise ConnectionError('잘못된 FILE 헤더')

    fromID = find_id(cs)
    toSocket = clientSockets.get(toID)
    error = None
    if fromID is None:
        error = 'Fail:Need_ID'
    elif toSocket is None:
        error = 'Fail:No_Such_User'
    else:
        try:
            send_line(toSocket, f'FILE:{fromID}:{toID}:{filename}:{size}')
        except OSError:
            error = 'Fail:Send_Error'

    # 에러가 나도 본문은 끝까지 읽어서 버려야 다음 메시지와 섞이지 않는다
    remaining = size
    while remaining > 0:
        if not buf:
            buf = cs.recv(BUFSIZE)
            if not buf:
                raise ConnectionError('파일 수신 중 연결 종료')
        chunk, buf = buf[:remaining], buf[remaining:]
        remaining -= len(chunk)
        if error is None:
            try:
                toSocket.sendall(chunk)
            except OSError:
                error = 'Fail:Send_Error'

    if error is None:
        print(f'파일 전송: {fromID} -> {toID} {filename} {size} bytes')
    send_line(cs, error or 'Success:FILE')
    return buf


def msg_proc(cs, line):
    # 텍스트 한 줄을 처리한다. False를 반환하면 이 클라이언트와의 통신을 끝낸다.
    if not line:
        return True
    code = line.split(SEP, 1)[0].upper()

    try:
        if code == 'ID':
            tokens = line.split(SEP, 1)
            if len(tokens) < 2 or not tokens[1]:
                send_line(cs, 'Fail:Bad_Format')
            elif find_id(cs) is not None:
                send_line(cs, 'Fail:Already_Reg')
            elif tokens[1] in clientSockets:
                send_line(cs, 'Fail:ID_Taken')
            else:
                print('reg id:', tokens[1])
                clientSockets[tokens[1]] = cs
                send_line(cs, 'Success:Reg_ID')

        elif code == 'TO':
            tokens = line.split(SEP, 3)
            fromID = find_id(cs)
            if len(tokens) < 4:
                send_line(cs, 'Fail:Bad_Format')
            elif fromID is None:
                send_line(cs, 'Fail:Need_ID')
            elif (toSocket := clientSockets.get(tokens[2])) is None:
                send_line(cs, 'Fail:No_Such_User')
            else:
                send_line(toSocket, f'TO:{fromID}:{tokens[3]}')
                send_line(cs, 'Success:1to1')

        elif code == 'BR':
            tokens = line.split(SEP, 2)
            fromID = find_id(cs)
            if len(tokens) < 3:
                send_line(cs, 'Fail:Bad_Format')
            elif fromID is None:
                send_line(cs, 'Fail:Need_ID')
            else:
                for s in list(clientSockets.values()):
                    if s is not cs:
                        try:
                            send_line(s, f'BR:{fromID}:{tokens[2]}')
                        except OSError:
                            pass
                send_line(cs, 'Success:BR')

        elif code == 'QUIT':
            tokens = line.split(SEP, 1)                  # ['QUIT', 'kim']
            if len(tokens) < 2 or not tokens[1]:
                send_line(cs, 'Fail:Bad_Format')         # QUIT:ID 형식이 아니면 거부
            else:
                print('QUIT 요청:', tokens[1])
                return False                             # 실제 제거는 소켓 기준으로 remove_client가 한다

        else:
            send_line(cs, 'Fail:Unknown_Command')

        return True

    except Exception as e:
        print('msg_proc 에러:', e)
        return False


def client_com(cs):
    buf = b''
    running = True
    while running:
        try:
            data = cs.recv(BUFSIZE)
        except Exception:
            print('클라이언트와 연결 종료(에러)')
            break
        if not data:
            print('클라이언트와 연결 종료')
            break

        buf += data
        while b'\n' in buf:                          # TCP 특징 반영: 완성된 줄을 하나씩 처리
            line, buf = buf.split(b'\n', 1)
            text = line.decode().strip()

            if text.upper().startswith('FILE' + SEP):  # 파일 전송
                try:
                    buf = handle_file(cs, buf, text)  # 파일 본문을 소비하고 남은 데이터를 받음
                except Exception as e:
                    print('파일 전송 중 연결 종료:', e)
                    running = False
                    break
            elif msg_proc(cs, text) == False:
                running = False
                break
    remove_client(cs)


def client_acpt(serverSocket):
    while True:
        try:
            cs, addr_info = serverSocket.accept()
        except OSError:
            print('accept 종료')
            return
        print('연결 수락: client 정보', addr_info)
        Thread(target=client_com, args=(cs,), daemon=True).start()


if __name__ == '__main__':
    serverSocket = socket(AF_INET, SOCK_STREAM)
    serverSocket.setsockopt(SOL_SOCKET, SO_REUSEADDR, 1)
    serverSocket.bind(ADDR)
    serverSocket.listen(10)
    print('대기 (엔터를 누르면 서버 종료)')

    Thread(target=client_acpt, args=(serverSocket,), daemon=True).start()

    input()

    for s in list(clientSockets.values()):
        try:
            s.shutdown(SHUT_RDWR)
            s.close()
        except OSError:
            pass
    clientSockets.clear()
    serverSocket.close()
    print('종료')
