var Db_base = require('./neo4j_base.js');
var DbField = require('./db_field.js');
var RequiredArgumentExeption = require('../exceptions/required_argument_exception.js');
var uuid = require('uuid/v4');

var Organization = function(args){
  Db_base.call(this);

  // Organization propperties
  this.db_fields = new Organization.db_blueprint();

  _init(this, args);

  // TODO test for regexp
  this.validate = function(db_fields){
    if (db_fields.orgNumber.data.length == 9 &&
    	/^\d+$/.test(db_fields.orgNumber.data) &&
      db_fields.orgName.data.length > 3 &&
      /^[a-zA-ZæøåÆØÅ\s]+$/.test(db_fields.orgName.data) &&
      db_fields.email.data.length > 5 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(db_fields.email.data) &&
      db_fields.phone.data.length >= 8 &&
      /^\d+$/.test(db_fields.phone.data)
      ){
        return true;
      }
      return false;
  }

  function _init(me, args) {
    let fields = me.db_fields;
    if (!('uuid' in args)){
      fields['uuid'].data = uuid();
    }
    for (let arg in args){
      if (arg in me.db_fields){
        fields[arg].data = args[arg]
      }
    }
  }
// end of organization
}

Object.assign(Organization, Db_base);


Organization.db_blueprint = function(){
  this.uuid = new DbField(null, ['unique']);
  this.orgNumber = new DbField();
  this.orgName = new DbField();
  this.email = new DbField();
  this.phone = new DbField();
  this.description = new DbField();
}


module.exports = Organization
