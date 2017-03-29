var Db_base = require('./neo4j_base.js');
var DbField = require('./db_field.js');
var uuid = require('uuid/v4');



var Dugnad = function(args){
  Db_base.call(this);


  this.db_fields = new Dugnad.db_blueprint();

  _init(this, args);

  this.validate = function(db_fields){
    if (db_fields.title.data.length > 5 ||
      db_fields.start_time.data < db_fields.end_time.data ||
      db_fields.max_partisipants.data > 0){
        return true;
    }
    return false;
  }

  function _init(me, args) {
    var fields = me.db_fields;
    if (!('uuid' in args)){
      fields['uuid'].data = uuid();
    }
    for (arg in args){
      if (arg in me.db_fields){
        fields[arg].data = args[arg];
      }
    }
  }
}

Object.assign(Dugnad, Db_base);

Dugnad.db_blueprint = function(){
  this.uuid = new DbField(null, ['unique']),
  this.title = new DbField(),
  this.location = new DbField(),
  this.status = new DbField(),
  this.start_time = new DbField(),
  this.end_time = new DbField(),
  this.description = new DbField(),
  this.max_partisipants = new DbField()
}

module.exports = Dugnad;
