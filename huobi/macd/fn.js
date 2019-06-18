 const compare = (dif,dea) => {
    let res = '';
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

module.exports = compare;

