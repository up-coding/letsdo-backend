const logger = require('pino')();
const moment = require('moment'); 

let currentTime = moment();

let captureInfo = (message,origin,importance)=>{
    let infoMessage = {
        timestamp:currentTime,
        message:message,
        origin:origin,
        level:importance
    };
    logger.info(infoMessage);
    return infoMessage;
 }

let captureError = (errorMessage,errorOrigin,errorLevel)=>{
    let errorResponse = {
        timestamp: currentTime,
        message:errorMessage,
        origin:errorOrigin,
        level:errorLevel
    };
    logger.error(errorResponse);
    return errorResponse;
}

module.exports = {
    error:captureError,
    info:captureInfo
}

