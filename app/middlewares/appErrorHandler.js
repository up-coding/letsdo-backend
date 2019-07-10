const response = require('./../libs/responseLib');

let globalErrorHandler = (err,req,res,next) =>{
   console.log(err);
   res.send(response.generate(true,'Some error occured at global level.',500,null));
}

let globalNotFoundHandler = (req,res,next)=>{
    console.log('route logger called');
    res.send(response.generate(true,'Route not found in the application.',404,null));
}

module.exports = {
    globalErrorHandler:globalErrorHandler,
    globalNotFoundHandler:globalNotFoundHandler
}