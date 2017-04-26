const driver = require('../../neo4j_db')();

var onEnd = function(req, res, next){
  res.on('end', () => {
    res.set("Connection", "close");
    driver.close();
  });
  next();
}


module.exports = onEnd;
