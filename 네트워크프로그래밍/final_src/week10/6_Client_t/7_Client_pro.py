# Simple Protocol 반영 클라이언트
from socket import *
from threading import Thread, Event
import sys

HOST = '127.0.0.1'
PORT = 5000
SEP = ':'

stop_event = Event()

# 메세지 수신
def listen_for_messages(sock):
    buf = b''                                    # 아직 줄이 완성되지 않은 데이터
    while not stop_event.is_set():
        try:
            data = sock.recv(1024)
            if not data:
                print('\n서버와 연결이 끊어졌습니다. 엔터를 누르면 종료됩니다.')
                break
            buf += data
            while b'\n' in buf:                  # 완성된 줄만 꺼내서 출력
                line, buf = buf.split(b'\n', 1)
                print(line.decode())             # 서버에서 온 그대로 출력
        except Exception:
            if not stop_event.is_set():
                print('\nrecv 에러. 엔터를 누르면 종료됩니다.')
            break
    stop_event.set()

# 메세지 송신(소켓, 필드값(여러 개 가능))
def send(sock, *fields):
    # 필드들을 SEP로 이어 붙이고 끝에 \\n을 붙여 전송
    sock.sendall((SEP.join(fields) + '\n').encode())

if __name__ == '__main__':
    myID = input('내 ID 입력: ').strip()
    while not myID or SEP in myID:
        myID = input(f'ID는 비어 있거나 "{SEP}"를 포함할 수 없습니다. 다시 입력: ').strip()

    sock = socket(AF_INET, SOCK_STREAM)
    try:
        sock.connect((HOST, PORT))
    except Exception:
        print('연결 실패')
        sys.exit()
    print('연결 성공')

    send(sock, 'ID', myID)         # ID:kim\n

    t = Thread(target=listen_for_messages, args=(sock,), daemon=True)
    t.start()

    print('사용법: 그냥 입력=전체 전송 / @상대ID 메시지=1:1 전송 / Q=종료')

    while not stop_event.is_set():
        msg = input()
        if stop_event.is_set():
            break

        if msg in ('Q', 'q'):
            send(sock, 'QUIT')                   # QUIT\n
            break
        elif msg.startswith('@'):
            parts = msg[1:].split(' ', 1)
            if len(parts) < 2 or not parts[0] or not parts[1]:
                print('형식: @상대ID 메시지')
                continue
            toID, text = parts
            send(sock, 'TO', myID, toID, text)   # TO:kim:lee:점심 먹자\n
        elif msg:
            send(sock, 'BR', myID, msg)          # BR:kim:안녕하세요\n

    stop_event.set()
    sock.close()
    print('종료')