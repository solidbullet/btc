let http = require('http');
let fs = require('fs');
let url = require('url');
const ws = require('./crawler/ws');

let results = [];
let data = {'eosusdt':[],'btcusdt':[],'ethusdt':[]};
let vol = {'eosusdt':0,'btcusdt':0,'ethusdt':0};
let close0 = {'eosusdt':0,'btcusdt':0,'ethusdt':0};
let syms = ['eosusdt','btcusdt','ethusdt'];
let TO_HTML = {'eosusdt':{},'btcusdt':{},'ethusdt':{}};
 
// 创建服务器
http.createServer( function (request, response) {  
   // 解析请求，包括文件名
   var pathname = url.parse(request.url).pathname;
   
   // 输出请求的文件名
   console.log("Request for " + pathname + " received.");
   
   let comm =  pathname.substr(1);
   if(comm == 'getjson'){
	   response.writeHead(200, {'Content-Type': 'application/json'});
	   response.end(JSON.stringify(TO_HTML));
	   //console.log("getjson",JSON.stringify(TO_HTML));
   }else{
	   // 从文件系统中读取请求的文件内容
	   fs.readFile(pathname.substr(1), function (err, data) {
		  if (err) {
			 console.log(err);

			 response.writeHead(404, {'Content-Type': 'text/html'});
		  }else{             
			 response.writeHead(200, {'Content-Type': 'text/html'});    

			 response.end(data.toString());        
		  }
		  // response.end();
	   });     
   }
   
}).listen(8888);

check();
function check() {
    
    // let symbol = 'btcusdt';
    // 检查rest行情和ws行情是否一致并打印
    // console.log('ws',JSON.stringify(ws.OrderBook));
    // console.log('rest',JSON.stringify(rest.OrderBook));
    //console.log('============ Check Start =============');

	for(let i = 0;i < syms.length;i++)
	{
		orderbook = ws.OrderBook[syms[i]];
		// data[syms[i]] = [];
		if(orderbook)
		{		
			let id = orderbook.id;
			let price = orderbook.close;
			close0[syms[i]] = orderbook.close;
			let amount = orderbook.amount;
			//console.log(syms[i]," id: ",id," vol[syms[i]]: ",vol[syms[i]]);
			// close0 = orderbook.close;
			//vol[syms[i]] = (orderbook.amount > vol[syms[i]])?orderbook.amount:vol[syms[i]];
			if(amount > vol[syms[i]]){
				vol[syms[i]] = amount;
			}
			//console.log("orderbook vol: ",orderbook.amount,'vol[syms[i]]',vol[symbol]);
			
			
			if(data[syms[i]].length == 0 || data[syms[i]][0].id != orderbook.id)
			{
				let obj = arrpush(id,price,vol[syms[i]]);
				data[syms[i]].unshift(obj);
				vol[syms[i]] = 0;
			}
		}	
	}
	for(let i = 0;i < syms.length;i++)
	{
		let N  = 7
		if(data[syms[i]].length == N){
			data[syms[i]].pop();
		}
		if(data[syms[i]].length >= N-1){
			let result= {close0:0,close1:0,avg_vol:0,vol:0,bs:0}
			let bs = data[syms[i]][0].vol/get_vol_avg(data[syms[i]]);
			result.close0 = close0[syms[i]];
			result.close1 = data[syms[i]][0].price;
			result.avg_vol = get_vol_avg(data[syms[i]]);
			result.vol = data[syms[i]][0].vol;
			result.bs = bs;
			TO_HTML[syms[i]] = result;
		}
	}


    //console.log('TO_HTML',TO_HTML);

    //console.log('============ Check End =============');
    setTimeout(check, 3000);
}


function arrpush(i,p,v)
{
    let obj = {id:i,price:p,vol:v}
    return obj;
}

function get_vol_avg(k){
    if(k.length < 2) return;
    let sum = 0;
    for(let i = 1;i < k.length;i++){
        sum += k[i].vol;
     }
     return sum/(k.length -1);

}