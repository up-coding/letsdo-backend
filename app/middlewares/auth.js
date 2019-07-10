const Auth = require('./../models/Auth');
const logger = require('./../libs/loggerLib');
const response = require('./../libs/responseLib');
const token = require('./../libs/tokenLib');
const check = require('./../libs/checkLib');

let isAuthorized = (req, res, next)=>{
    if(req.params.authToken || req.query.authToken || req.body.authToken || req.header('authToken')){
       Auth.findOne({authToken: req.params.authToken || req.query.authToken || req.body.authToken || req.header('authToken')})
       .exec()
       .then((authDetails)=>{
            
           if(check.isEmpty(authDetails)){
              logger.error('No authorization token is present.','Authorization middleware.',10);
              res.send(response.generate(true,'Invalid or Expired authorization token.',404,null));
           }else{
               token.verifyToken(authDetails.authToken, authDetails.tokenSecret, (err, decoded)=>{
                  if(err){
                    logger.error(err.message, 'Authorization middleware.',10);
                    res.send(response.generate(true,'Failed to verify token.', 500, null));
                  }else{
                      req.user = { userId: decoded.data.userId };
                      
                      next();
                  }
               });
           }
       })
       .catch((err)=>{
          logger.error(err.message,'Authorization middleware.',10);
          res.send(response.generate(true,'Failed to authorized.',500,null));
       });
    }else{
        logger.error('Authorization token missing.','Autorization middleware.',10);
        res.send(response.generate(true,'Authorization token is missing in request.',400,null));
    }
}

module.exports = {
    isAuthorized:isAuthorized
}