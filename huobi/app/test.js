function throttle (func, duration) {
    // duration 以秒计
    let last
    return function () {
         let now = Date.now()
         if (last && (now - last) < duration * 1e3) return
        last = now
        func.apply(this, arguments)
    }
}

let last;
console.log('last',last);
if(last) console.log('last1');