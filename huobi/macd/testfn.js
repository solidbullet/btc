const compare = require('./indicator/fn')

let dif = [4,1,1,1,1,1,1,1,1,1];
let dea = [2,2,2,2,2,2,2,2,2,2];

// let res = compare(dif,dea);
// console.log(res)
const IsBreakZero = histogram => {
    let h0 = histogram[0];
    histogram.shift();
    let flag_down = histogram.every((item,index,arr) => item > 0 ) && h0 < 0;
    let flag_rise = histogram.every((item,index,arr) => item < 0 ) && h0 > 0; 
    let res = '';
    if(flag_down){
        res = '下穿零轴'
    }else if(flag_rise){
        res = '上穿零轴'
    }else res= 'Waiting';
    return res;
}

let h = [-1,2,3,4,2,2,2,2,2,5]; //[-1,2,3,4,2,2,2,2,2,5]
// let histogram2 = [1,-2,-2,-2,-2,-2,-2,-2,-2,-5];



let str = '/getjson?60min';
let index = str.indexOf("?")
let str1 = str.substr(index+1);
console.log(str1)
console.log(str.startsWith('/getjson'))