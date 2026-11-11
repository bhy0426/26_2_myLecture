# client ID BR TO FILE Q
from socket import *
from threading import Thread, Event
import os
import sys

HOST = '127.0.0.1'
PORT = 5000
BUFSIZE = 1024
SEP = ':'

stop_event = Event()

def send(sock, *fields):
    #필드들을 SEP로 이어 붙이고 끝에 \\n을 붙여 전송
    sock.sendall((SEP.join(fields) + '\n').encode())

# File 전송 처리
def send_file(sock, myID, toID, path):
    path = os.path.expanduser(path)
    if not os.path.isfile(path):
        print('파일을 찾을 수 없습니다:', path)
        return
    filename = os.path.basename(path)
    size = os.path.getsize(path)

    send(sock, 'FILE', myID, toID, filename, str(size))    # 헤더 한 줄  FILE:kim:lee:rose.jpg:123094\n
    with open(path, 'rb') as f:                            # 파일내용 (정확히 size 바이트)
        while True:
            chunk = f.read(BUFSIZE)
            if not chunk:
                break
            sock.sendall(chunk)
    print(f'파일 전송 요청 완료: {filename} ({size} bytes)')


def listen_for_messages(sock):
    buf = b''
    f = None              # 파일 수신 중이면 열린 파일 객체
    remaining = 0         # 파일 본문 남은 바이트
    try:
        while not stop_event.is_set():
            data = sock.recv(BUFSIZE)
            if not data:
                print('\n서버와 연결이 끊어졌습니다. 엔터를 누르면 종료됩니다.')
                break
            buf += data

            while buf:
                if f:                                          # 파일 본문 구간: 텍스트로 해석하지 않음
                    chunk, buf = buf[:remaining], buf[remaining:]
                    f.write(chunk)
                    remaining -= len(chunk)
                    if remaining == 0:
                        f.close()
                        f = None
                        print('파일 저장 완료')
                elif b'\n' in buf:                             # 헤더/텍스트 한 줄
                    line, buf = buf.split(b'\n', 1)
                    text = line.decode().strip()
                    if text.startswith('FILE' + SEP):
                        # FILE:보낸ID:받는ID:파일명:크기
                        _, fromID, _, rest = text.split(SEP, 3)
                        filename, _, size_text = rest.rpartition(SEP)
                        remaining = int(size_text)
                        savename = 'recv_' + (os.path.basename(filename) or 'file')  # 경로 제거 + 덮어쓰기 방지
                        f = open(savename, 'wb')
                        print(f'\n{fromID}님이 파일을 보냅니다: {savename} ({remaining} bytes)')
                        if remaining == 0:
                            f.close()
                            f = None
                    else:
                        print(text)                            # 서버에서 온 그대로 출력
                else:
                    break                                      # 줄이 덜 왔으면 다음 recv를 기다림
    except Exception as e:
        if not stop_event.is_set():
            print('\nrecv 에러:', e, '엔터를 누르면 종료됩니다.')
    finally:
        if f:
            f.close()
        stop_event.set()


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

    send(sock, 'ID', myID)                                     # ID:kim\n

    Thread(target=listen_for_messages, args=(sock,), daemon=True).start()

    print('사용법: 그냥 입력=전체 전송, @상대ID 메시지=1:1, /file 상대ID 파일경로포함 파일명=파일 전송, Q=종료')

    try:
        while not stop_event.is_set():
            msg = input()
            if stop_event.is_set():
                break

            if msg in ('Q', 'q'):
                send(sock, 'QUIT', myID)                       # QUIT:kim\n
                break
            # File 전송
            elif msg.startswith('/file '):   # /file 
                parts = msg.split(' ', 2)
                if len(parts) < 3 or not parts[1] or not parts[2]:
                    print('형식: /file 상대ID 파일경로')
                    continue
                send_file(sock, myID, parts[1], parts[2])       # file 전송
            elif msg.startswith('@'):
                parts = msg[1:].split(' ', 1)
                if len(parts) < 2 or not parts[0] or not parts[1]:
                    print('형식: @상대ID 메시지')
                    continue
                send(sock, 'TO', myID, parts[0], parts[1])     # TO:kim:lee:점심 먹자\n
            elif msg:
                send(sock, 'BR', myID, msg)                    # BR:kim:안녕하세요\n
    except (KeyboardInterrupt, EOFError):
        pass
    except OSError as e:
        print('송신 에러:', e)

    stop_event.set()
    sock.close()
    print('종료')