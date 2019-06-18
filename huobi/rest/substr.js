const http = require('http');
const fs = require('fs');


// async function get_all () {
//     let symbol = ['eosusdt','btcusdt','bsvusdt','ltcusdt','trxusdt','ethusdt','atomusdt'];//,'htusdt','bsvusdt','ltcusdt','trxusdt'
//     let TO_HTML = [];
//     let kl_promise=[];
//     for(let i = 0;i <symbol.length;i++){
//         kl_promise.push(getKline(symbol[i]));
//     };
//     let res = await Promise.all(kl_promise);
//     return res;
// }

// get_all().then((res) => {
//     console.log(res)
// });

// getKline('btcusdt').then((res)=>{
//     console.log(res)
// })
function getKline(symbol) {
    return new Promise((resolve, reject) => {
        let err = {"status":"error"};
        let kline = '';
        http.get('http://stock2.finance.sina.com.cn/futures/api/json.php/IndexService.getInnerFuturesMiniKLine5m?symbol='+symbol, (res) => {
        // console.log('状态码:', res.statusCode);
        // console.log('请求头:', res.headers);
            res.on('data', (d) => {
              kline += d;
            //   console.log(d);
            });
            res.on("end",()=>{
                console.log(Object.keys(JSON.parse(kline)).length);
                resolve(JSON.parse(kline));
                // resolve(kline);//JSON.parse(kline)
            })
        })
        // reject(err);
    })
}

getKline('TA1909')



