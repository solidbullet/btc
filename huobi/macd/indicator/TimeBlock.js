const dateToString= date  =>{ 
    let year = date.getFullYear(); 
    let month =(date.getMonth() + 1).toString(); 
    let day = (date.getDate()).toString();  
    if (month.length == 1) { 
        month = "0" + month; 
    } 
    if (day.length == 1) { 
        day = "0" + day; 
    }
    let dateTime = year + "-" + month + "-" + day;
    return dateTime; 
  };

const isRangeIn =(num,minnum,maxnum) =>{ //判断数字是否在区间内
    if(num <=maxnum && num>=minnum) return true;
    else return false;
}

const isWeekEnd = date => {
    let holiday = ['2019-09-13','2019-10-01','2019-10-02','2019-10-03','2019-10-04','2019-10-07'];//日或者月必须是两位数，不足补0
    let day = date.getDay(); 
    let res = holiday.some(v => v == dateToString(date))   
    if(day == 0 || day == 6) res =  true;
    return res;
    };

const isMarketOpen = (date) =>{  //开盘时间: 9：00—10：15  ; 10：30—11：30  ; 13：30—15：00  ;21:00 至 23:30
    let time1_str = dateToString(date) + ' 09:00:00';
    let time2_str = dateToString(date) + ' 10:15:00';
    let time3_str = dateToString(date) + ' 10:30:00';
    let time4_str = dateToString(date) + ' 11:30:00';
    let time5_str = dateToString(date) + ' 13:30:00';
    let time6_str = dateToString(date) + ' 15:00:00';
    let time7_str = dateToString(date) + ' 21:00:00';
    let time8_str = dateToString(date) + ' 23:30:00';

    let time1 = new Date(time1_str).getTime();
    let time2 = new Date(time2_str).getTime();
    let time3 = new Date(time3_str).getTime();
    let time4 = new Date(time4_str).getTime();
    let time5 = new Date(time5_str).getTime();
    let time6 = new Date(time6_str).getTime();
    let time7 = new Date(time7_str).getTime();
    let time8 = new Date(time8_str).getTime();

    if(isRangeIn(date,time1,time2) || isRangeIn(date,time3,time4) || isRangeIn(date,time5,time6) || isRangeIn(date,time7,time8)) return true;
    return false;
}

const onMonitor = date => isMarketOpen(date)  && !isWeekEnd(date);

module.exports = {isWeekEnd,isMarketOpen,onMonitor};
