const moment = require('moment');
const http = require('../framework/httpClient');
const Promise = require('bluebird');

// const BASE_URL = 'https://api.huobi.pro';
// 此地址用于国内不翻墙调试
const BASE_URL = 'https://api.huobi.br.com';

var orderbook = {};

exports.OrderBook = orderbook;


function handle(symbol, kline) {
    
    // console.log(kline);
    orderbook[symbol] = get_arr(symbol,kline);
    // console.log(orderbook[symbol]);
    // TODO 根据数据生成你想要的K线 or whatever...
    // TODO 记录数据到你的数据库或者Redis
}

function get_kline(symbol) {
    return new Promise(resolve => {
        let url = `${BASE_URL}/market/history/kline?period=5min&size=12&symbol=${symbol}`;
        // console.log(url);
        http.get(url, {
            timeout: 3000,
            gzip: true
        }).then(data => {
            // console.log(data);
            let json = JSON.parse(data);
            let t = json.ts;
            let kline = json.data;
            handle(symbol, kline);
            resolve(null);
        }).catch(ex => {
            console.log('http请求 .catch is: ',symbol, ex);
            resolve(null);
        });
    });
}

function run() {
    // console.log(`run ${moment()}`);

    let list = ['eosusdt','btcusdt','bsvusdt','ltcusdt','trxusdt','ethusdt','atomusdt'];
    Promise.map(list, item => {
        return get_kline(item);
    }).then(() => {
        setTimeout(run, 2000);
    });

    // get_kline('btcusdt').then(data => {
    //        //return  data;
    //        console.log(data);
    //     })//.then(data=>console.log(data))
}

run();

function get_arr(symbol,kline){ //通过k线序列计算出数组，在前端页面展示
    const average = arr => arr.reduce((acc, val) => acc + val, 0) / arr.length;
    let list = [];
    // console.log(eos.data.length);
    for(let i =0;i < kline.length;i++)
    {
        list.push(kline[i].amount) //amount
    }
    let close0 = kline[0].close;
    // console.log('close0',close0);
    let close1 = kline[1].close;
    // console.log(Indicator.SMA(list, 5));
    // console.log(macd(list, 26, 12, 9));
    let vol_0 = list.shift()
    let avg = average(list);
    let bs = list[0]/avg
    let data = {"symbol":symbol,"close0":close0,"close1":close1,"avg":avg,"vol_1":list[0],"bs":bs};
    return data;

}