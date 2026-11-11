import socket

server = "127.0.0.1"
port = 6001
BUFSIZE = 1024
#msg = "Hello UDP Server~~~"
clientSocket = socket.socket(family=socket.AF_INET, type=socket.SOCK_DGRAM)
msg = input()

# 생성된 UDP 소켓을 사용하여 서버로 전송
clientSocket.sendto(msg.encode(), (server,port))

data, address = clientSocket.recvfrom(BUFSIZE)

msgFromServer = "Message from Server {}".format(data)
print(msgFromServer)
input()