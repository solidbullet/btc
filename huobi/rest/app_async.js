var separateReqPool = {maxSockets: 20};
var request = require('request');
var async = require('async');


let url_array = [];//Array of all the urls to call
let url_pre = 'https://api.huobi.br.com/market/history/kline?period=5min&size=3&symbol=';
let symbol = ['atomusdt','irisusdt','iotausdt','adausdt','xrpusdt','bchusdt'];
for(let i =0;i<symbol.length;i++){
    url_array.push(url_pre+symbol[i]);
}
// console.log(url_array);

async.map(url_array, function(item, callback){
    request({url: item, pool: separateReqPool}, function (error, response, body) {
        console.log(body);
        });
      }, function(err, results){
        console.log(results);
      })
