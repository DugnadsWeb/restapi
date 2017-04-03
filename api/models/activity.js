const Db_base = require('./neo4j_base.js');
const DbField = require('./db_field.js');
const uuid = require('uuid/v4');


var Activity = function(args){
  Db_base.call(this);

  _init(this, args);

}
