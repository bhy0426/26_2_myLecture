# Simple server
# 클라이언트가 연결 요청하면 서버가 클라이언트에게 문자열 전송 후 연결 종료
import socket

# 서버 소켓 생성
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
# UNIX:socket.AF_UNIX/ IPv4:socket.AF_INET/ IPv6:socket.AF_INET6     
# TCP:socket.SOCK_STREAM/ UDP:socket.SOCK_DGRAM/ IP:socket.SOCK_RAW

# 서버 주소
# (주소, 포트) 형식의 튜플로 저장
server_IP = (socket.gethostbyname(socket.gethostname()), 5000)
# '127.0.0.1'   # local
# '0.0.0.0'   # INADDR_ANY

# 서버 소켓과 IP 주소 바인딩
# server_IP 튜플을 인자로 전달
s.bind(server_IP)

# 서버 대기
# listen은 TCP 계층에게 서버가 대기 중이라는 사실을 전달
s.listen(5)
print(f"waiting",server_IP)

# 클라이언트가 connect를 요청하면
# 클라이언트 소켓과 클라이언트의 주소(튜플) 전달 받음
clientsocket, address = s.accept()
# clientsocket: 클라이언트와 소통할 소켓
# address: ip address 객체 반환

print(f"Connection from {address} has been established")

# 클라이언트 소켓을 이용해 클라이언트에게 바이트 데이터를 전달
clientsocket.send(bytes("Hi!! there !!!!", "utf-8"))

# 클라이언트 소켓 종료
clientsocket.close()
# 서버 소켓 종료
s.close()