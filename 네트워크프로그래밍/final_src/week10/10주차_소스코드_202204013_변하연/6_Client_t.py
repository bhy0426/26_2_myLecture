# 6_client_th
# 사용자로부터 exit 문자열이 올때까지 계속 서버로 전송
# exit 문자열을 수신하면 서버에게 exit 전송하고 연결 종료

from socket import *
from threading import Thread, Event
import sys

HOST = '127.0.0.1'
PORT = 5000
SEP = ':'
stop_event = Event()  # 끝냄을 알리는 깃발

def listen_from_server(sock):
    while not stop_event.is_set():
        try:
            data = sock.recv(1024)

            if not data:            # 서버가 연결을 끊음
                print('\n서버와 연결이 끊어졌습니다. 엔터를 누르면 종료됩니다.')
                break

            print('\nBroadcast message:', data.decode())
        except Exception:
            if not stop_event.is_set():     # 에러
                print('\nrecv 에러. 엔터를 누르면 종료됩니다.')
            break
    stop_event.set() # 어떤 이유든 수신이 끝나면 깃발 올림

if __name__ == '__main__':
    sock = socket(AF_INET, SOCK_STREAM)
    try:
        sock.connect((HOST, PORT))
    except Exception:
        print('연결 실패')
        sys.exit()
    print('연결 성공')

    t = Thread(target=listen_from_server, args=(sock,), daemon=True)
    t.start()

    myID = input('내 ID 입력:').strip()
    while not myID or SEP in myID:
        myID = input(f'ID가 비어 있거나 "{SEP}"을 포함할 수 없습니다, 다시 입력하세요:').strip()

    while not stop_event.is_set(): 
        msg = input('입력 데이터: ')

        # 입력 대기 중에 연결이 끊어지면 반복 종료
        # 만약 입력 대기 중에 연결이 끊어지면 아래의 send() 함수를 실행할 때 오류가 발생함
        if stop_event.is_set():
            break
        
        sock.send((myID+SEP+msg).encode())
        if msg == 'exit':
            break
        
    stop_event.set() # listen_from_server 함수에게 신호를 전달
    sock.close()
    print('종료')