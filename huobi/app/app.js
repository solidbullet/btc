//引入模块
const ws = require('../crawler/ws');

const http =require("http");
//引入文件模块
const fs= require("fs");

let klines = [];
let vol_1 = 0;
let close0 = 0;//当前价格
//创建服务器
const server = http.createServer(function(req,res){
	//设置响应头
	res.writeHead(200,{"Content-Type":"text/html;charset=UTF-8"})
	//请求的路由地址
	if(req.url == "/" || req.url=="/index.html"){
		fs.readFile("./app/index.html",'utf-8',function(err,data){
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
		if(klines.length > 0){
			let data = {'symbol':'btcusdt','close0':close0,'close1': klines[0].close1, 'vol_1': klines[0].vol_1.toFixed(2),'bs':5,'vol_n5':300};
			res.end(JSON.stringify(data));
		}
	}
	else{
		res.writeHead(200,{"Content-Type":"text/html;charset=UTF-8"});
			//加载的数据结束
			res.end('<h1> 所需内容未找到404 </h1>');
	}
}).listen(8888)
console.log('http://127.0.0.1:8888')
//监听端口

function check() {
    let symbol = 'btcusdt';
    // 检查rest行情和ws行情是否一致并打印
    // console.log('ws',JSON.stringify(ws.OrderBook));
    // console.log('rest',JSON.stringify(rest.OrderBook));
    console.log('============ Check Start =============');
    orderbook = ws.OrderBook[symbol];
    if(orderbook)
    {
        let id = orderbook.id;
		let close1 = orderbook.close;
		close0 = orderbook.close;
        vol_1 = (orderbook.amount > vol_1)?orderbook.amount:vol_1; //每一跳成交量都会变化，记录一分钟k最大的成交量
        console.log("vol: ",orderbook.amount);
        if(klines.length == 0 || klines[0].id != orderbook.id)
        {
            let obj = arrpush(id,close1,vol_1);
            klines.unshift(obj);
            vol_1 = 0;//1分钟k线成交量归零
        }
    }
    if(klines.length ==4)
    {
        klines.pop();
    }
    console.log(klines);

    console.log('============ Check End =============');
    setTimeout(check, 1000);
}

setTimeout(check, 2000);

function arrpush(i,p,v)
{
    let obj = {id:i,close1:p,vol_1:v}
    return obj;
}