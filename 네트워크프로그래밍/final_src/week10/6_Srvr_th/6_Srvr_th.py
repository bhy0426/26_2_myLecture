# 6_server_thd
# 다중 클라이언트로 부터 메시지를 받아서 브로드캐스트
# 클라이언트가 exit 문자열이 보내올때까지 계속 수신
# exit 문자열을 수신하면 while 문 탈출하여 연결종료

from socket import *    # import socket 으로 하면 오류 
from select import *
from threading import Thread

# 상수 및 전역 변수
HOST = '127.0.0.1' #gethostbyname(gethostname())     
PORT = 5000
BUFSIZE = 1024
ADDR = (HOST, PORT)

# 연결된 client의 소켓 집합 set of connected client sockets
# 집합은 인덱스가 없음
clientSockets = set()

def client_com(cs):
    while True:
        try:  # 아래 문장 무조건 실행
            # recv와 connect에서 오류가 발생할 가능성이 높기 때문에 예외처리를 함
            data = cs.recv(BUFSIZE)  # 1. 상대방으로 부터 데이터 받기
        except Exception as e:  # 예외 처리: 상대방의 소켓이 끊겼을 때 오류
            print(f"클라이언트와 연결 종료")
            if cs in clientSockets:
                clientSockets.remove(cs)
            break
        else:  # 위 문장 에러 없을 시 실행
            if not data :  # 상대방이 close() 호출한 경우 정상 종료
                cs.close()
                if cs in clientSockets:
                    clientSockets.remove(cs)
                break
            msg = data.decode()
            if msg == 'exit': # exit라는 메세지를 받으면 정상 종료
                cs.close()
                if cs in clientSockets:
                    clientSockets.remove(cs)
                break
            print('broadcast data : ',msg)

            for socket in clientSockets: # broadcast
                socket.send(msg.encode())


if __name__ == "__main__":
    # 1. 소켓 생성
    serverSocket = socket(AF_INET, SOCK_STREAM)
    ##     socket.socket(socket.AF_INET, socket.SOCK_STREAM)

    # 2. 소켓 주소 정보 할당
    serverSocket.bind(ADDR)
    print('바인드')

    # 3. 연결 수신 대기 상태
    serverSocket.listen(10)
    print('대기')

   
    while True:
         # 4. 연결 수락
        clientSocket, addr_info = serverSocket.accept()
        print('연결 수락: client 정보 ', addr_info)
        # 클라이언트 소켓 정보 저장
        clientSockets.add(clientSocket)


        
        # 5. 데이터 송수신
        t = Thread(target=client_com, args=(clientSocket,))
        t.daemon = True  # main thread가 종료되면 함께 종료
        t.start()

    # 6.소켓 종료
    for cs in clientSockets:
        cs.close()
    serverSocket.close()
    print('종료')