const https = require('https');
let Indicator = require('./indicator.js');
const macd = require('macd');

// }).on('error', (e) => {
//   console.error(e);
// });

function getKline(symbol) {
    return new Promise((resolve, reject) => {
        let kline = '';
        https.get('https://api.huobi.br.com/market/history/kline?period=4hour&size=100&symbol='+symbol, (res) => {
        // console.log('状态码:', res.statusCode);
        // console.log('请求头:', res.headers);
            res.on('data', (d) => {
                kline += d;
            });
            res.on("end",()=>{
                resolve(JSON.parse(kline));
            })
        })
    })
}

async function testResult() {
    let eos = await getKline('eosusdt');
    // let btc = await getKline('btcusdt');
    let list = [];
    // console.log(eos.data.length);
    for(let i =0;i < eos.data.length;i++)
    {
        list.push(eos.data[i].close)
    }
    // console.log(Indicator.SMA(list, 5));
    console.log(macd(list, 26, 12, 9));
    // console.log(list);
    // console.log(btc.data[0]);
}

setInterval(testResult, 2000)