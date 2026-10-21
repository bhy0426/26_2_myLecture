let v = 0;

setTimeout(() => setInterval(() => v += 1, 1500), 1000);

const promise = new Promise(resolve => {
    queueMicrotask(() => setTimeout(() => resolve(), 1500));
})
.then(() => v += 5)
.then(() => v *= 2);

setTimeout(() => console.log(v), 7000);