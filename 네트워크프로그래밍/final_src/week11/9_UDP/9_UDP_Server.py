import socket

host = '127.0.0.1'
port = 6001
BUFSIZE = 1024
msg = "Hello UDP Client~~~"
severSocket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

severSocket.bind((host,port))

print("UDP Server listening")

while True:
    data,address =  severSocket.recvfrom(BUFSIZE)
    clientMsg = "Message from Client:{}".format(data)
    clientIP  = "Client IP Address:{}".format(address)

    print(clientMsg)
    print(clientIP)

    # Sending a reply to client
    severSocket.sendto(msg.encode(), address)

    