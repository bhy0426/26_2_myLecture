# 5_Echo_client.py
# 연결 후 서버에게 데이터 보내고 종료
# https://docs.python.org/3/library/socket.html?highlight=socket#module-socket
# cmd 창에서 실행하려면 파일 있는 곳으로 이동 후 python3 5_Echo_client.py 


import socket
from ipaddress import ip_address

HOST = input("서버 IP 주소를 입력하세요: ").strip()  # 뒤에 공백 제거
# HOST = '127.0.0.1'    
PORT = 5000                # 서버와 같은 포트 사용

# with 문
# 해당 블록 안에서만 serverSocket 변수를 사용
with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as serverSocket:
    serverSocket.connect((HOST, PORT))
    print('연결 완료')

    # 서버에 데이터 전송
    msg = input("전송할 메시지를 입력하세요: ")
    # sendall()을 사용하는 이유, 버퍼에 데이터가 남아서 전송되지 않는 문제가 있을 수 있기 때문에
    serverSocket.sendall(bytes(msg,'utf-8'))
    print('전송 완료')

    # 서버로부터 데이터를 받음
    data = serverSocket.recv(1024)   # 버퍼크기: 1024 한번에 1024바이트씩 수신
    print('받은 데이터:', data.decode('utf-8'))
    serverSocket.close()