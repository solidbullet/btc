let http = require('http');
let fs = require('fs');
let url = require('url');
const ws = require('./crawler/restkline');



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

    }else if(req.url == "/getjson"){
      let symbol = ['eosusdt','btcusdt','xmrusdt','bsvusdt','ltcusdt','trxusdt','ethusdt','atomusdt','irisusdt','rsrusdt','bttusdt'];//
    //   let TO_HTML = [];
    //   for(let i = 0;i<symbol.length;i++){
    //         let orderbook = ws.OrderBook[symbol[i]];
    //         if(orderbook) TO_HTML.push(orderbook);
	// 	}
	  let data = symbol.map(v => ws.OrderBook[v]);
    // console.log('hrml',TO_HTML);
      res.end(JSON.stringify(data)); 

	}
	else{
		res.writeHead(200,{"Content-Type":"text/html;charset=UTF-8"});
			//加载的数据结束
			res.end('<h1> 所需内容未找到404 </h1>');
	}
}).listen(8081)
console.log('http://127.0.0.1:8081')
