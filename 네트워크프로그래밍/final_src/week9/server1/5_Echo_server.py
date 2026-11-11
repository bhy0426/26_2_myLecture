# 5_Echo_server.py program 이지 버젼 5_echo_client.py와 연계
# 클라이언트가 보내는 데이터 받고 종료

import socket

HOST = socket.gethostbyname(socket.gethostname())           
PORT = 5000            # 사용하지 않는 포트

serverSocket =socket.socket(socket.AF_INET, socket.SOCK_STREAM) 
serverSocket.bind((HOST, PORT))
serverSocket.listen(1)

print('대기 ', HOST, PORT)
clientSocket, addr = serverSocket.accept()  # 소켓과 (주소, 포트) 로 반환
    
print('연결:', addr)
while True:

    # 클라이언트로부터 데이터를 전달받아서 data에 저장
    # 바이트 크기이기 때문에 2의 배수
    data = clientSocket.recv(1024)
    # data가 없으면 반복 중단
    # 클라이언트가 소켓을 종료하면 반복 중단
    if not data: break
     #   A returned empty bytes object indicates that the client has disconnected
    
    # 클라이언트에게 전달받은 데이터를 다시 전달
    clientSocket.sendall(data)

    # 클라이언트에게 전달받은 데이터를 출력
    print('받은 데이터:', data.decode('utf-8'))
   

print('연결종료')
clientSocket.close()
serverSocket.close()