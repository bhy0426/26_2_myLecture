from socket import *
from threading import Thread

HOST = ''
PORT = 5000
BUFSIZE = 1024
ADDR = (HOST, PORT)
SEP = ':'

clientSockets = {}      # {client ID: client 소켓}

# ?
def send_line(s, text):
    # 한 줄(끝에 \\n)로 전송
    s.sendall((text + '\n').encode())

# clientSockets 딕셔너리에서 cs의 cid를 반환
def find_id(cs):
    for cid, s in list(clientSockets.items()):
        if s is cs:
            return cid
    return None

# clientSockets 딕셔너리에서 cs를 제거
def remove_client(cs):
    cid = find_id(cs)
    if cid is not None:
        clientSockets.pop(cid, None)
        print('Disconnected:', cid)
    try:
        cs.close()
    except OSError:
        pass

# msg_proc() - clientSocket에서 구분한 line을 읽고 해석하는 함수
def msg_proc(cs, line):
    #한 줄 처리: False를 반환하면 이 클라이언트와의 통신을 끝낸다.
    line = line.strip()  #공백제거
    if not line:
        return True
    code = line.split(SEP, 1)[0].upper()

    try:
        if code == 'ID':
            tokens = line.split(SEP, 1)              # 한번 자르기 ['ID', 'kim']
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
            return True

        elif code == 'TO':
            tokens = line.split(SEP, 3)              # ['TO', from, to, msg]
            fromID = find_id(cs)                     # 메시지 속 ID 대신 소켓에 등록된 ID 사용
            if len(tokens) < 4:
                send_line(cs, 'Fail:Bad_Format')
            elif fromID is None:
                send_line(cs, 'Fail:Need_ID')
            else:
                toID, toMsg = tokens[2], tokens[3]
                print(f'1to1: From {fromID} To {toID} Message {toMsg}')
                toSocket = clientSockets.get(toID)
                if toSocket is None:
                    send_line(cs, 'Fail:No_Such_User')
                else:
                    send_line(toSocket, f'TO:{fromID}:{toMsg}')
                    send_line(cs, 'Success:1to1')
            return True

        elif code == 'BR':
            tokens = line.split(SEP, 2)              # ['BR', from, msg]
            fromID = find_id(cs)
            if len(tokens) < 3:
                send_line(cs, 'Fail:Bad_Format')
            elif fromID is None:
                send_line(cs, 'Fail:Need_ID')
            else:
                print('broadcast data:', line)
                for s in list(clientSockets.values()):
                    if s is cs:
                        continue
                    try:
                        send_line(s, f'BR:{fromID}:{tokens[2]}')
                    except OSError:
                        pass                         # 한 명이 실패해도 나머지에게 계속 전송
                send_line(cs, 'Success:BR')
            return True

        elif code == 'QUIT':
            return False

        else:
            send_line(cs, 'Fail:Unknown_Command')
            return True

    except Exception as e:
        print('msg_proc 에러:', e)
        return False

# clientSocket에서 온 데이터를 코드와 데이터로 구분?
def client_com(cs):
    # 바이트열 생성
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
        # 전송받은 바이트 데이터를 buf에 저장
        buf += data
        # 줄바꿈이 나올 때마다 line에 데이터를 저장하고
        # msg_proc(cs, line.decode())에서 False를 반환하면 클라이언트 소켓 실행 종료
        while b'\n' in buf:                          # TCP 특징 반영: 완성된 줄을 하나씩 처리
            line, buf = buf.split(b'\n', 1)
            if msg_proc(cs, line.decode()) == False:
                running = False
                break
    # 
    remove_client(cs)


def client_acpt(serverSocket):
    while True:
        try:
            clientSocket, addr_info = serverSocket.accept()
            print('연결 수락: client 정보', addr_info)
            Thread(target=client_com, args=(clientSocket,), daemon=True).start()
        except Exception:
            print('accept 종료')
            break


if __name__ == '__main__':
    serverSocket = socket(AF_INET, SOCK_STREAM)
    serverSocket.setsockopt(SOL_SOCKET, SO_REUSEADDR, 1) # 소켓 옵션
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
            continue
    clientSockets.clear()

    serverSocket.close()
    print('종료')