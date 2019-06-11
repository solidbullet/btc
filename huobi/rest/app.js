const https = require('https');
const http = require('http');
const fs= require("fs");


let get_json = new Promise((resolve,reject) => {
    
    let symbol = ['eosusdt','btcusdt','htusdt','bsvusdt','ltcusdt','trxusdt'];
    let TO_HTML = [];
    let kl_promise=[];
    for(let i = 0;i <symbol.length;i++){
        kl_promise.push(getKline(symbol[i]));
    };
    
    Promise.all(kl_promise).then(function(values) {
        for(let item in values){
            let ch0 = values[item].ch;
            let symbol = ch0.slice(7,14);
            let kline = values[item].data;
            // console.log("ch0",ch0);
            TO_HTML.push(get_arr(symbol,kline));
            // console.log(get_arr(symbol,kline));
        };
        resolve(TO_HTML);
        // console.log(TO_HTML);
      });
    });


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

		// let html = `<html><head><title>我的第2个 HTML 页面</title></head>		
		// <body><p>xxxx元素的内容会显示在浏览器中。</p><p></p>
		// </body>	<script>setTimeout(function(){location.reload()},1000);</script></html>`;
		// res.end(html);
	}else if(req.url == "/getjson"){
        get_json.then(result => {
            res.end(JSON.stringify(result)); //JSON.stringify(get_json())
        });
			
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
        let kline = '';
        https.get('https://api.huobi.br.com/market/history/kline?period=5min&size=20&symbol='+symbol, (res) => {
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