# 6_client_exit
# 사용자로부터 exit 문자열이 올때까지 계속 서버로 전송
# exit 문자열을 수신하면 서버에게 exit 전송하고 연결 종료

from socket import *
#from select import *
import sys

HOST = input("서버 IP 주소를 입력하세요: ").strip()  # 뒤에 공백 제거
PORT = 10000
BUFSIZE = 1024
ADDR = (HOST,PORT)

serverSocket = socket(AF_INET, SOCK_STREAM)  # 서버에 접속하기 위한 소켓을 생성한다.

# 예외 처리 구문
try:
    serverSocket.connect(ADDR)  # 서버에 접속을 시도한다.
# 예외 발생 시
except Exception as e:
    print('%s:%s' %ADDR)
    sys.exit()

print('연결 성공')

while True:
    sendData = input("입력 데이터 : ")
    serverSocket.send(sendData.encode())
    if sendData == 'exit': # 특정 메세지를 받으면 종료
       break
    data = serverSocket.recv(BUFSIZE)
    print('받은 데이터 : ', data.decode())
    
serverSocket.close()
print('종료')