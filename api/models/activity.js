const Db_base = require('./neo4j_base.js');
const DbField = require('./db_field.js');
const uuid = require('uuid/v4');


var Activity = function(args){
  Db_base.call(this);

  this.db_fields = new Activity.db_blueprint();

  _init(this, args);

  this.validate = function(db_fields){
    if (db_fields.startTime.data < db_fields.endTime.data ||
      db_fields.maxPartisipants.data >= 0){
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
      console.log(arg);
      if (arg in me.db_fields){
        fields[arg].data = args[arg];
      }
    }
  }

}

Object.assign(Activity, Db_base);

Activity.db_blueprint = function(){
  this.uuid = new DbField(null, ['unique']),
  this.title = new DbField("");
  this.startTime = new DbField("0"),
  this.endTime = new DbField("0"),
  this.description = new DbField(""),
  this.maxPartisipants = new DbField(0)
}

module.exports = Activity;
