#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <sys/wait.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <unistd.h>
#include <signal.h>

#define BUF_LEN 128

// 좀비 프로세스 방지
void child_handler(int sig)
{
    while (waitpid(-1, NULL, WNOHANG) > 0);
}

int main(int argc, char *argv[])
{
    char buffer[BUF_LEN];
    struct sockaddr_in server_addr;
    struct sockaddr_in client_addr;
    char temp[20];

    int server_fd;
    int client_fd;
    int msg_size;
    socklen_t len;

    // 프로세스 아이디
    pid_t pid;

    // 포트 번호 확인
    if (argc != 2)
    {
        printf("usage : %s [port]\n", argv[0]);
        exit(0);
    }

    // 자식 프로세스가 종료될 때, 좀비 프로세스가 남지 않도록 처리
    signal(SIGCHLD, child_handler);
    
    // 서버 소켓 생성
    if ((server_fd = socket(AF_INET, SOCK_STREAM, 0)) == -1)
    {
        printf("Server : Can't open stream socket\n");
        exit(0);
    }

    // 서버 주소 초기화
    memset(&server_addr, 0x00, sizeof(server_addr));
    server_addr.sin_family = AF_INET;
    server_addr.sin_addr.s_addr = htonl(INADDR_ANY);
    server_addr.sin_port = htons(atoi(argv[1]));

    // bind()
    if (bind(server_fd, (struct sockaddr *)&server_addr, sizeof(server_addr)) < 0)
    {
        printf("Server : Can't bind local address.\n");
        close(server_fd);
        exit(0);
    }

    // listen()
    if (listen(server_fd, 5) < 0)
    {
        printf("Server : Can't listening connect.\n");
        close(server_fd);
        exit(0);
    }
    printf("Server : waiting connection request.\n");


    // 여러 클라이언트의 연결을 계속 기다림
    while (1)
    {
        len = sizeof(client_addr);

        // 클라이언트 연결 수락
        client_fd = accept(server_fd, (struct sockaddr *)&client_addr, &len);
        if (client_fd < 0)
        {
            printf("Server : accept failed.\n");
            continue;
        }

        // 클라이언트 IP 주소 확인
        inet_ntop(AF_INET, &client_addr.sin_addr, temp, sizeof(temp));
        printf("Server : %s client connected.\n", temp);

        // 자식 프로세스 생성
        pid = fork();
        
        // 자식 프로세스 생성 실패
        if (pid < 0)
        {
            printf("Server : fork failed.\n");
            close(client_fd);
            continue;
        }

        // 자식 프로세스, pid가 0인 경우
        if (pid == 0)
        {
            // 자식은 server_fd를 사용하지 않음
            // 즉, 자식 프로세스의 server_fd(서버 소켓)를 닫음
            close(server_fd);

            // 클라이언트와 에코 통신
            while (1)
            {
                memset(buffer, 0x00, sizeof(buffer));

                // 클라이언트로부터 메시지 수신
                msg_size = read(client_fd, buffer, BUF_LEN - 1);

                // 연결 종료
                if (msg_size <= 0)
                {
                    break;
                }

                buffer[msg_size] = '\0';

                printf("Server [%d] : %s client : %s", getpid(), temp, buffer);

                // 받은 메시지를 그대로 클라이언트에게 전송
                write(client_fd, buffer, msg_size);
            }

            // 클라이언트 연결 종료
            close(client_fd);
            printf("Server [%d] : %s client closed.\n", getpid(), temp);

            // 자식 프로세스 종료
            exit(0);
        }
        // 부모 프로세스, pid가 0이 아닌 경우
        else
        {
            // 부모는 client_fd를 사용하지 않음
            close(client_fd);

            // 부모는 다시 accept()로 돌아감
            // 따라서 다른 클라이언트가 동시에 접속할 수 있음
        }
    }
    close(server_fd);
    return 0;
}