#https://docs.python.org/ko/3/library/threading.html
import threading
import time


# 싱글 쓰레드는 lock이 필요없지만
# 싱글 쓰레드의 비동기 방식이나, 멀티 쓰레드 방식에서는 lock으로 공유 자원을 관리해야함
shared_number = 0
lock = threading.Lock()  # threading에서 Lock 함수 가져오기


def thread_1(p_id, number):
    global shared_number
    print("thread_", p_id,"number = ", number)
    
    for i in range(number):
        lock.acquire()  # 작업이 끝나기 전까지 다른 쓰레드가 공유데이터 접근을 금지
        shared_number += 1
        lock.release()  # lock 해제
        
    print("thread_", p_id,"end")


if __name__ == "__main__":

    threads = []

    start_time = time.time()
    t1 = threading.Thread(target=thread_1, args=(1, 10000000,)) #천만
    t1.start() # start() 함수로 쓰레드를 시작
    threads.append(t1)

    t2 = threading.Thread(target=thread_1, args=(2, 10000000,)) #천만
    t2.start()
    threads.append(t2)
    
    t3 = threading.Thread(target=thread_1, args=(3, 10000000,)) #천만
    t3.start()
    threads.append(t3)

    for t in threads:
        t.join() # 쓰레드가 모든 작업을 마칠 때까지 기다리는 것

    print("--- %s seconds ---" % (time.time() - start_time))

    print("shared_number=", end=""), print(shared_number)
    print("end of main")