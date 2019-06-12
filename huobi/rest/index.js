const https = require('https');
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
        https.get('https://api.huobi.br.com/market/history/kline?period=5min&size=3&symbol='+symbol, (res) => {
        // console.log('状态码:', res.statusCode);
        // console.log('请求头:', res.headers);
            res.on('data', (d) => {
              kline += d;
            //   console.log(d);
            });
            res.on("end",()=>{
                let index1= kline.indexOf("<html>"); 
                let res = '{"status":"error"}';
                if(index1 == -1){
                    res = kline;
                } 
                resolve(JSON.parse(res));
                // resolve(kline);//JSON.parse(kline)
            })
        })
        // reject(err);
    })
}


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


    async function queue(arr) {
     let res = []
     for (let fn of arr) {
       var data= await fn;
       res.push(data);
     }
     return await res
   }
   
   let symbol = ['eosusdt','btcusdt','bsvusdt','ltcusdt','trxusdt','ethusdt','atomusdt'];//,'htusdt','bsvusdt','ltcusdt','trxusdt'
   let TO_HTML = [];
   let kl_promise=[];
   for(let i = 0;i <symbol.length;i++){
       kl_promise.push(getKline(symbol[i]));
   };

   queue(kl_promise)
     .then(data => {
        //return  data;
        console.log(data);
     })//.then(data=>console.log(data))
   



