 const IsCross = (dif,dea) => { //判断是否金叉死叉
    let res = 'Waiting';
 if(dif.length != dea.length){
     console.log('macd 的dif和dea数组长度不相等');
 }else{ //第二位到最后一位两个数组比较，全部小于的话就+1，全部大于的话就-1，累计数值跟len比较
     let diff0 = dif[0] - dea[0];
     let sum = 0;
     for(let i = 1;i < dif.length;i++){
        if(dif[i] < dea[i]){
            sum += 1;
        }else if(dif[i] > dea[i]) sum += -1;
     }
     if(diff0 > 0 && sum == dif.length-1) res = '金叉';
     if(diff0 < 0 && -sum == dif.length-1) res = '死叉';
     return res;
 }

}

const IsBreakZero = histogram => {  //判断是否穿越零轴
    let h0 = histogram[0];
    histogram.shift();
    let flag_down = histogram.every((item,index,arr) => item > 0 ) && h0 < 0; //every函数判断是不是所有的元素都大于0
    let flag_rise = histogram.every((item,index,arr) => item < 0 ) && h0 > 0; 
    let res = '';
    if(flag_down){
        res = '下穿零轴'
    }else if(flag_rise){
        res = '上穿零轴'
    }else res= 'Waiting';
    return res;
}


module.exports = {IsCross,IsBreakZero};

