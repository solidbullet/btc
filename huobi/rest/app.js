const https = require('https');
const http = require('http');
const fs= require("fs");

const server = http.createServer(function(req,res){
	//设置响应头
	res.writeHead(200,{"Content-Type":"text/html;charset=UTF-8"})
	//请求的路由地址
	if(req.url == "/" || req.url=="/index.html"){
		fs.readFile("./index.html",'utf-8',function(err,data){
            if(err)
            {
                console.log(err);
            } 
			res.writeHead(200,{"Content-Type":"text/html;charset=UTF-8"});
			res.end(data);
		})

    }else if(req.url=="/shanzhai.html"){
		fs.readFile("./shanzhai.html",'utf-8',function(err,data){
            if(err)
            {
                console.log(err);
            } 
			res.writeHead(200,{"Content-Type":"text/html;charset=UTF-8"});
			res.end(data);
		})
    }else if(req.url == "/getjson"){
        let symbol = ['eosusdt','btcusdt','bsvusdt','ltcusdt','trxusdt'];//,'htusdt','bsvusdt','ltcusdt','trxusdt'
        let TO_HTML = [];
        let kl_promise=[];
        for(let i = 0;i <symbol.length;i++){
            kl_promise.push(getKline(symbol[i]));
        };
        try{
        Promise.all(kl_promise).then(function(values) {
            // console.log(values);
            for(let item in values){
                if(values[item].status == 'error') continue;
                let ch0 = values[item].ch;
                let symbol = ch0.slice(7,14);
                let kline = values[item].data;
                TO_HTML.push(get_arr(symbol,kline));
            };
            res.end(JSON.stringify(TO_HTML)); 
          });
        }catch (err) {
            console.log(err);
          }		
	}else if(req.url == "/getjson1"){
        let symbol = ['atomusdt','irisusdt','iotausdt','adausdt','xrpusdt','bchusdt'];//,'htusdt','bsvusdt','ltcusdt','trxusdt'
        let TO_HTML = [];
        let kl_promise=[];
        for(let i = 0;i <symbol.length;i++){
            kl_promise.push(getKline(symbol[i]));
        };
        try{
            Promise.all(kl_promise).then(function(values) {
                // console.log(values);
                for(let item in values){
                    if(values[item].status == 'error') continue;
                    let ch0 = values[item].ch;
                    let symbol = ch0.slice(7,14);
                    let kline = values[item].data;
                    TO_HTML.push(get_arr(symbol,kline));
                };
                res.end(JSON.stringify(TO_HTML)); 
              });
        }catch (err) {
            console.log(err);
          }
    }
	else{
		res.writeHead(200,{"Content-Type":"text/html;charset=UTF-8"});
			//加载的数据结束
			res.end('<h1> 所需内容未找到404 </h1>');
	}
}).listen(8888)
console.log('http://127.0.0.1:8888')


function getKline(symbol) {
    return new Promise((resolve, reject) => {
        let err = {"status":"error"};
        let kline = '';
        https.get('https://api.huobi.br.com/market/history/kline?period=5min&size=12&symbol='+symbol, (res) => {
        // console.log('状态码:', res.statusCode);
        // console.log('请求头:', res.headers);
            res.on('data', (d) => {
              kline += d;
            //   console.log(d);
            });
            res.on("end",()=>{
                let index1= kline.indexOf("<html>"); 
                // console.log(symbol," is has html  ",index1)
                let res = '{"status":"error"}';
                if(index1 == -1){
                    res = kline;
                } 
                resolve(JSON.parse(res));
                // resolve(kline);//JSON.parse(kline)
            });
            res.on('error', function(e) {
                console.log('problem with request: ' + e);
              });
        })
        // reject(err);
    })
}





// async function testResult() {  
//     let symbol = ['eosusdt','btcusdt']
//     let eos = await getKline(symbol[0]);
//     let btc = await getKline(symbol[1]);
//     let res_eos = get_arr(symbol[0],eos);
//     let res_btc = get_arr(symbol[1],btc);
//     console.log(res_btc);
// }

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
// setInterval(testResult, 2000)