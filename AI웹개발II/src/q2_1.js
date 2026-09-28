let v = 1;

let id = setImmediate(() => v += 5);

new Promise(resolve => {
    setImmediate(() => v += 2);
    resolve();
}).then(() => setImmediate(() => v *= 2));

setImmediate(() => console.log(v));