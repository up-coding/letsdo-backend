const moment = require('moment');
const momenttz = require('moment-timezone');
const timezone = 'Asia/Calcutta';



let getLocalTime = ()=>{
    return moment().tz(timezone).format();
}

let convertToLocalTime = ()=>{
    return momenttz.tz(time,timezone).format('LLLL');
}

let now = ()=>{
    return moment.utc().format();
}

module.exports = {
    getLocalTime:getLocalTime,
    convertToLocalTime:convertToLocalTime,
    now:now
}