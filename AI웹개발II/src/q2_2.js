let v = 1;

let id = setInterval(() => v += 3, 1000);
setImmediate(() => v *= 3);

new Promise(resolve => setImmediate(() => resolve(v -= 2))).
then(v => setTimeout(() => v /= 2, 1000));

setTimeout(() => {
    clearInterval(id);
    console.log(v);
}, 2000);

// 왜 2초 뒤에 setTimeout의 콜백 함수가 setInterval의 콜백 함수보다 먼저 실행되는지 여쭤보기