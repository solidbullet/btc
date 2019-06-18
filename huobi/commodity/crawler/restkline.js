const moment = require('moment');
const http = require('../framework/httpClient');
const Promise = require('bluebird');

// const BASE_URL = 'http://stock2.finance.sina.com.cn/futures/api/json.php';
// 此地址用于国内不翻墙调试
const BASE_URL = 'http://stock2.finance.sina.com.cn/futures/api/json.php';
// http://stock2.finance.sina.com.cn/futures/api/json.php/IndexService.getInnerFuturesMiniKLine5m?symbol=TA1909
// 依次是行情时间，开盘价、最高价、最低价、收盘价、成交量。

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

function get_kline(symbol) {
    return new Promise(resolve => {
        let url = `${BASE_URL}/IndexService.getInnerFuturesMiniKLine5m?symbol=${symbol}`;
        // console.log(url);
        http.get(url, {
            timeout: 2000,
            gzip: true
        }).then(data => {
            // console.log(data);
            let json = JSON.parse(data).slice(0,12);
            // console.log(typeof(json[0]));
            // console.log(json);
            handle(symbol, json);
            resolve(null);
        }).catch(ex => {
            console.log('http请求 .catch is: ',symbol, ex);
            resolve(null);
        });
    });
}

function run() {
    // console.log(`run ${moment()}`);

    let list = ['TA1909','RB1909','EG1909'];
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
    
    let list_vol = [];
    let list_diff = [];
    // 依次是行情时间0，开盘价1、最高价2、最低价3、收盘价4、成交量5。
    for(let i =0;i < kline.length;i++)
    {
        list_vol.push(kline[i][5]) //成交量
        list_diff.push(Math.abs(kline[i][4] - kline[i][1]));
    }
    let close0 = parseFloat(kline[0][4]);
    // console.log('close0',close0);
    let close1 = parseFloat(kline[1][4]);
    // console.log(Indicator.SMA(list, 5));
    // console.log(macd(list, 26, 12, 9));
    let list_vol_1 = list_vol.map(value => parseFloat(value));
    let vol_0 = list_vol_1.shift()
    
    let avg = average(list_vol_1);
    
    let bs = list_vol[0]/avg
    let data = {"symbol":symbol,"close0":close0,"close1":close1,"avg":avg,"vol_1":parseFloat(list_vol[0]),"bs":bs,"diff":BREAKUP(list_diff)};
    return data;

}

var STDEVP = values => { 
    var avg = average(values)
    var squareDiffs = values.map(value => Math.pow(value - avg, 2))
    return Math.sqrt(average(squareDiffs))
  }

var BREAKUP = list =>{ //计算：最近K线实体长度/前面11根K线实体长度标准差的,反应突破强度
    list_1 = list.map(value => parseFloat(value));
    
    let diff0 = list_1[0] ; //最近一根K的实体长度
    list_1.shift()
    
    let result = STDEVP(list_1); //前面N根K的实体长度的标准差
    
    let ratio = 0;
    if (result != 0) ratio = diff0/result;
    // console.log(ratio,'result',result,'diffo',diff0);
    return ratio;

}