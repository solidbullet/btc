const MyIndicator = require('./indicator/TimeBlock')

let date = new   Date();
let time_test = '2019-06-21 15:14:00';
let date0 = new Date(time_test);

console.log(MyIndicator.onMonitor(date0));