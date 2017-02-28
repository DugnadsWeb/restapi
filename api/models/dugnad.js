var Db_base = require('./neo4j_base.js');
var DbField = require('./db_field.js');
var uuid = require('uuid/v4');



var Dugnad = function(args){
  Db_base.call(this);


  this.db_fields = {
    uuid: new DbField(null, ['unique']),
    title: new DbField(),
    status: new DbField(),
    start_time: new DbField(),
    end_time: new DbField(),
    description: new DbField(),
    max_partisipants: new DbField()
  }

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
    for (field in fields){
      if (field in args){
        fields[field].data = args[field];
      }
    }
  }
}

Object.assign(Dugnad, Db_base);

module.exports = Dugnad;
