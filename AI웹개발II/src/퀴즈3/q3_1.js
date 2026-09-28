let v = 0;

const k1 = setInterval(() => v -= 1, 200);
const k2 = setInterval(() => v += 1, 100);
let k3;

const promise = new Promise(resolve => 
    k3 = setInterval(() => resolve(), 250)
).then(() => {
    clearInterval(k1);
    return new Promise((_, reject) => setTimeout(() => reject(), 100));
})
.then(() => v += 5)
.catch(() => clearInterval(k2))
.finally(() => v *= 2);

setTimeout(() => {
    clearInterval(k3);
    console.log(v);
}, 500);