# 4_Simple Client
# 서버에게 연결 요청 후 서버가 보낸 문자열 받고 연결 종료
import socket

# 서버 소켓 생성
serverSocket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

# 서버 소켓에 연결
serverSocket.connect((socket.gethostname(), 5000))

# 서버로부터 전달받은 바이트 데이터를 저장
msg = serverSocket.recv(100)  # byte 배열로 반환
print(msg.decode('utf-8'))    # decoding

# 서버 소켓 종료
serverSocket.close()
