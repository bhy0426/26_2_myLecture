#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include <sys/types.h>
#include <sys/socket.h>

#include <netinet/in.h>
#include <arpa/inet.h>

#include <unistd.h>

#define BUF_LEN 128


int main(int argc, char *argv[])
{
    int client_fd;

    struct sockaddr_in server_addr;

    char buffer[BUF_LEN];

    int msg_size;


    /*
     * 사용법
     *
     * ./client [server IP] [port]
     */
    if (argc != 3)
    {
        printf("usage : %s [server IP] [port]\n",
               argv[0]);

        exit(0);
    }


    /*
     * 소켓 생성
     */
    if ((client_fd = socket(
            AF_INET,
            SOCK_STREAM,
            0)) == -1)
    {
        printf("Client : Can't open stream socket\n");
        exit(0);
    }


    /*
     * 서버 주소 초기화
     */
    memset(
        &server_addr,
        0x00,
        sizeof(server_addr)
    );


    server_addr.sin_family = AF_INET;

    server_addr.sin_addr.s_addr =
        inet_addr(argv[1]);

    server_addr.sin_port =
        htons(atoi(argv[2]));


    /*
     * 서버에 연결
     */
    if (connect(
            client_fd,
            (struct sockaddr *)&server_addr,
            sizeof(server_addr)) < 0)
    {
        printf("Client : Can't connect to server.\n");

        close(client_fd);

        exit(0);
    }


    printf("Client : connected to server.\n");
    printf("Type 'quit' to exit.\n\n");


    /*
     * 여러 번 에코 통신
     */
    while (1)
    {
        /*
         * 버퍼 초기화
         */
        memset(
            buffer,
            0x00,
            sizeof(buffer)
        );


        /*
         * 메시지 입력
         */
        printf("Input : ");
        fflush(stdout);


        if (fgets(
                buffer,
                BUF_LEN,
                stdin) == NULL)
        {
            break;
        }


        /*
         * quit 입력하면 종료
         */
        if (strncmp(buffer, "quit", 4) == 0)
        {
            break;
        }


        /*
         * 서버로 메시지 전송
         */
        msg_size = strlen(buffer);

        write(
            client_fd,
            buffer,
            msg_size
        );


        /*
         * 서버의 에코 메시지 수신
         */
        memset(
            buffer,
            0x00,
            sizeof(buffer)
        );


        msg_size = read(
            client_fd,
            buffer,
            BUF_LEN - 1
        );


        if (msg_size <= 0)
        {
            printf("Server disconnected.\n");
            break;
        }


        buffer[msg_size] = '\0';


        /*
         * 에코 메시지 출력
         */
        printf("Echo : %s", buffer);
    }


    /*
     * 연결 종료
     */
    close(client_fd);

    printf("Client : connection closed.\n");

    return 0;
}