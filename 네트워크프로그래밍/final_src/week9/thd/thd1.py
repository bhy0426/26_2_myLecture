#single thread
import time
import threading

def thread_first():
    print("the first thread starts")
    # for i in range(5):
    #     print(f"thread_1 is running {i}")
    time.sleep(1)
    print("the first thread ends")

def thread_second():
    print("the second thread starts")
    # for i in range(5):
    #     print(f"thread_2 is running {i}")
    time.sleep(1)
    print("the second thread ends")

def thread_third():
    print("the third thread starts")
    # for i in range(5):
    #     print(f"thread_3 is running {i}")
    time.sleep(1)
    print("the third thread ends")

class Timer():
    # 클래스 생성자
    def __init__(self):
        self.start_time = time.time()
        self.end_time = None
    def end(self):
        self.end_time = time.time()
        print(f"time spent : {self.end_time - self.start_time}")

timer = Timer()

thread1 = threading.Thread(target=thread_first)
thread2 = threading.Thread(target=thread_second)
thread3 = threading.Thread(target=thread_third)
thread1.start()
thread2.start()
thread3.start()
thread1.join()
thread2.join()
thread3.join()
# thread_first()
# thread_second()
# thread_third()

timer.end()