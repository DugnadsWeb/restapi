const jwt = require('jsonwebtoken');
const config = require('../../config');


var authMiddleware = function(req, res, next){
    // let POST user through
    if (req.url == '/user/' && req.method == 'POST'){
        next();
        return
    }
    if ('authorization' in req.headers){
      let token = req.headers.authorization.substring(7);
      jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
          res.status(401).send({message: "Token is invalid, log in and out"});
          return;
        }
        console.log('valid token :D');
        req.auth_token = decoded;
        next();
      })
    } else {
      next();
      //res.status(401).send({message: "Invalid auth token. Please log in again"});
    }
}

module.exports = authMiddleware;
