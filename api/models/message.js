const DbBase = require('./neo4j_base.js');
const DbField = require('./db_field.js');
const uuid = require('uuid/v4');


var Message = function(args){
  DbBase.call(this);

  this.db_fields = new Message.db_blueprint();

  this.validate = function(db_fields){
    if(db_fields.sent.data < new Date().getTime() &&
       db_fields.body.data.length > 0){
      return true;
    }
    return false;
  }


  _init(this, args)
  console.log(this.db_fields.body.data);

  function _init(me, args) {
    let fields = me.db_fields;
    if (!('uuid' in args)){
      fields['uuid'].data = uuid();
    }
    for (let arg in args){
      if (arg in me.db_fields){
        fields[arg].data = args[arg];
      }
    }
  }


}

Object.assign(Message, DbBase);

Message.db_blueprint = function(){
  this.uuid = new DbField(null, ['unique']);
  this.time_sent = new DbField();
  this.body = new DbField();
}


module.exports = Message;
