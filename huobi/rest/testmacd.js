const macd = require('macd');
let Indicator = require('./indicator.js');
var talib = require('ta-lib');

const average = arr => arr.reduce((acc, val) => acc + val, 0) / arr.length;
let list = [ 12648.9906,
    39976.299589064205,
    79598.76443548047,
    80308.37480028506,
    77092.32898820797,
    48067.119700274234,
    80198.0852,
    85905.19173077027,
    39721.43781270217,
    58050.2486902504,
    53184.709966814466,
    59700.6690659475,
    80569.42057066335,
    157418.72276905875,
    81093.65985082478,
    72032.96890650643,
    69417.9281828456,
    63705.57374690586,
    100343.81056451505,
    57045.37846598219 ];

list = list.map(keep2)

console.log(list);

let vol_0 = list.shift()

let avg = average(list);
let bs = list[0]/avg

let data = {"avg":avg,"vol_1":list[0],"bs":bs};
console.log(data)
// console.log(macd(list, 26, 12, 9));
// let sma =  talib.SMA(aa, 4);
// let sma1 = Indicator.SMA(list, 5);

// let ema1 = Indicator.EMA(list,26);
// console.log(ema);
// console.log(sma);
// console.log("DDDDDDDDDDDDDDDDDDDDDDD");
// console.log(sma1);
// console.log(talib.MACD(list,12,26,9));

function keep2(x) {
    return  Math.round(x*100)/100;
}



