
const moment = require('moment');
const http = require('../framework/httpClient');
const Promise = require('bluebird');
const ta = require('ta-lib');
const BASE_URL = 'https://api.huobi.br.com';
const average = arr => arr.reduce((acc, val) => acc + val, 0) / arr.length;

get_kline('btcusdt').then(data => {
        //return  data;
        let close = [];
        // for(let i =0;i<)
        for(let i in data){
            close.push(Math.abs(data[i].close - data[i].open));
        }
        // let MACD = ta.MACD(close,12,26,9);
        // let dif = MACD.macd;
        // let dea = MACD.signal;
        // let macd = MACD.histogram.map((x)=> x*2);

        let res = BREAKUP(close);
        console.log(res);
    })//.then(data=>console.log(data))
    
function get_kline(symbol) {
    return new Promise(resolve => {
        let url = `${BASE_URL}/market/history/kline?period=15min&size=10&symbol=${symbol}`;
        // console.log(url);
        http.get(url, {
            timeout: 3000,
            gzip: true
        }).then(data => {
            // console.log(data);
            let json = JSON.parse(data);
            let t = json.ts;
            let kline = json.data;
            //handle(symbol, kline);
            resolve(kline);
        }).catch(ex => {
            console.log('http请求 .catch is: ',symbol, ex);
            resolve(null);
        });
    });
}


var STDEVP = values => { 
    var avg = average(values)
    var squareDiffs = values.map(value => Math.pow(value - avg, 2))
    return Math.sqrt(average(squareDiffs))
  }

var BREAKUP = list =>{
    let diff0 = list[0]; //最近一根K的实体长度
    list.shift()

    let result = STDEVP(list); //前面N根K的实体长度的标准差
    let ratio = (result == 0)?0:diff0/result;
    return ratio;

}