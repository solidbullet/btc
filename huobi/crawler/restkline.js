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
    orderbook[symbol] = kline;
    // console.log(orderbook[symbol]);
    // TODO 根据数据生成你想要的K线 or whatever...
    // TODO 记录数据到你的数据库或者Redis
}

function get_kline(symbol) {
    return new Promise(resolve => {
        let url = `${BASE_URL}/market/history/kline?period=15min&size=100&symbol=${symbol}`;
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

