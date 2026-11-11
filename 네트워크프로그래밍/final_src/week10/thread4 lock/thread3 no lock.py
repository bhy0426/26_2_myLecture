# 
import threading
import time

shared_number = 0


def thread_1(p_id, number):
    # 전역 변수 shared_number 참조
    global shared_number
    print("thread_", p_id,"number = ", number)

    for i in range(number):
        # 여러 쓰레드가 접근하는 임계구역
        # lock이 필요한 부분
        shared_number += 1
        
    print("thread_", p_id,"end")


if __name__ == "__main__":

    threads = []

    start_time = time.time()
    t1 = threading.Thread(target=thread_1, args=(1, 10000000,)) #천만
    t1.start()
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
    