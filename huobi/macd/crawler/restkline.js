const moment = require('moment');
const http = require('../framework/httpClient');
const Promise = require('bluebird');
const ta = require('ta-lib');
const compare = require('../indicator/fn')

// const BASE_URL = 'https://api.huobi.pro';
// 此地址用于国内不翻墙调试
const BASE_URL = 'https://api.huobi.br.com';
const average = arr => arr.reduce((acc, val) => acc + val, 0) / arr.length;
var orderbook = {};

exports.OrderBook = orderbook;


function handle(symbol,close0,cross) {
    
    // console.log(kline);
    let res = {symbol:symbol,close0:close0,cross:cross};
    orderbook[symbol] = res;
    // console.log(orderbook[symbol]);
    // TODO 根据数据生成你想要的K线 or whatever...
    // TODO 记录数据到你的数据库或者Redis
}

function get_kline(symbol) {
    return new Promise(resolve => {
        let url = `${BASE_URL}/market/history/kline?period=5min&size=150&symbol=${symbol}`;
        // console.log(url);
        http.get(url, {
            timeout: 2000,
            gzip: true
        }).then(data => {
            // console.log(data);
            let json = JSON.parse(data);
            let t = json.ts;
            let kline = json.data;
            let close = kline.map(v => v.close)
            
            let MACD = ta.MACD(close,12,26,9);
            let dif = MACD.macd.slice(0,10);
            let dea = MACD.signal.slice(0,10);
            let macd = MACD.histogram.map((x)=> x*2).slice(0,10);
            // console.log(compare(dif,dea));
            handle(symbol, close[0],compare(dif,dea));
            resolve(null);
        }).catch(ex => {
            //console.log('http请求 .catch is: ',symbol, ex);
            resolve(null);
        });
    });
}

function run() {
    // console.log(`run ${moment()}`);

    let list = ['eosusdt','btcusdt','xmrusdt','bsvusdt','ltcusdt','trxusdt','ethusdt','atomusdt','irisusdt','rsrusdt','bttusdt'];
    Promise.map(list, item => {
        return get_kline(item);
    }).then(() => {
        setTimeout(run, 2000);
    });
}

run();

function get_arr(symbol,kline){ //通过k线序列计算出数组，在前端页面展示
    
    let list_vol = [];
    let list_diff = [];
    // console.log(eos.data.length);
    for(let i =0;i < kline.length;i++)
    {
        list_vol.push(kline[i].amount) //amount
        list_diff.push(Math.abs(kline[i].close - kline[i].open));
    }
    let close0 = kline[0].close;
    // console.log('close0',close0);
    let close1 = kline[1].close;
    // console.log(Indicator.SMA(list, 5));
    // console.log(macd(list, 26, 12, 9));
    let vol_0 = list_vol.shift()
    let avg = average(list_vol);
    let bs = list_vol[0]/avg
    let data = {"symbol":symbol,"close0":close0,"close1":close1,"avg":avg,"vol_1":list_vol[0],"bs":bs,"diff":BREAKUP(list_diff)};
    return data;

}

var STDEVP = values => { 
    var avg = average(values)
    var squareDiffs = values.map(value => Math.pow(value - avg, 2))
    return Math.sqrt(average(squareDiffs))
  }

var BREAKUP = list =>{ //计算：最近K线实体长度/前面11根K线实体长度标准差的,反应突破强度
    let diff0 = list[0]; //最近一根K的实体长度
    list.shift()

    let result = STDEVP(list); //前面N根K的实体长度的标准差
    let ratio = (result == 0)?0:diff0/result;
    return ratio;

}