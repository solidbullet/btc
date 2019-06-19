const moment = require('moment');
const http = require('./framework/httpClient');
const Promise = require('bluebird');

// const BASE_URL = 'https://api.huobi.pro';
// 此地址用于国内不翻墙调试
const BASE_URL = 'http://www.iwencai.com/stockpick/search?typed=1&preParams=&ts=1&f=1&qs=index_rewrite&selfsectsn=&querytype=stock&searchfilter=&tid=stockpick&w=%E6%88%90%E4%BA%A4%E9%A2%9D%E5%89%8D10';
const average = arr => arr.reduce((acc, val) => acc + val, 0) / arr.length;
var orderbook = {};

exports.OrderBook = orderbook;


function handle(symbol, kline) {
    
    // console.log(kline);
    orderbook[symbol] = get_arr(symbol,kline);
    // console.log(orderbook[symbol]);
    // TODO 根据数据生成你想要的K线 or whatever...
    // TODO 记录数据到你的数据库或者Redis
}

function get_kline() {
    return new Promise(resolve => {
        let url = `${BASE_URL}`;
        // console.log(url);
        http.get(url, {
            timeout: 3000,
            gzip: true
        }).then(data => {
            console.log(data);
            // let json = JSON.parse(data);
            // let t = json.ts;
            // let kline = json.data;
            // handle(symbol, kline);
            resolve(null);
        }).catch(ex => {
            console.log('http请求 .catch is: ',symbol, ex);
            resolve(null);
        });
    });
}

get_kline();