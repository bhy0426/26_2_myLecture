let v = 10;

setInterval(
    () => setInterval(() => v -= 1, 200), 
    200
);

const promise = new Promise(resolve => {
    process.nextTick(() => setTimeout(() => resolve(), 200));
})
.then(() => v -= 3)
.then(() => v -= 2);

setTimeout(() => console.log(v), 700);