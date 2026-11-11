# multi thread
import time
import threading

def thread_1(number):

    print("thread_1 number = ", end=""), print(number)

    for i in range(number):



def thread_2(number):

    print("thread_2 number = ", end=""), print(number)

    for i in range(number):



if __name__ == "__main__":

    threads = []

    start_time = time.time()




    for t in threads:
        # 쓰레드가 모든 작업을 마칠 때까지 기다리는 것

    print("--- %s seconds ---" % (time.time() - start_time))

    print("shared_number=", end=""), print(shared_number)
    print("end of main")
    