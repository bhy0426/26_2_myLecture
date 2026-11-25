from socket import *
from threading import Thread


HOST = '127.0.0.1'
PORT = 5000
ADDR = (HOST, PORT)
CLIENT_SIZE = 10

def client_com():
    pass

def client_accept(serverSocket):
    while True:
        try:
            clientSocket, addr_info = serverSocket.accept()
            print('연결 수락: client 정보', addr_info)
            Thread(target=client_com, args=(clientSocket,), daemon=True).start()
        except Exception:
            print('accept 종료')
            break

if __name__ == '__main__':
    serverSocket = socket(AF_INET, SOCK_STREAM)
    serverSocket.bind(ADDR)
    serverSocket.listen(CLIENT_SIZE)

    Thread(target=client_accept, args=(serverSocket,), daemon=True).start()