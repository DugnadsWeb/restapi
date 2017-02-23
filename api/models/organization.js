var Db_base = require('./neo4j_base.js');
var DbField = require('./db_field.js');
var RequiredArgumentExeption = require('../exceptions/required_argument_exception.js');
var uuid = require('uuid/v4');

var Organization = function(args){
  Db_base.call(this);

  // Organization propperties
  this.db_fields = Organization.db_blueprint;

  _init(this, args);

  // TODO add regex checks
  this.validate = function(db_fields){
    if (db_fields.org_number.data.length == 9 &&
      db_fields.name.data.length > 3 &&
      db_fields.email.data.length > 5 &&
      db_fields.phone.data.length >= 8){
        return true;
      }
      return false;
  }

  function _init(me, args) {
    fields = me.db_fields;
    if (!('uuid' in args)){
      fields['uuid'].data = uuid();
    }
    for (arg in args){
      if (arg in me.db_fields){
        fields[arg].data = args[arg]
      }
    }
  }
// end of organization
}

Object.assign(Organization, Db_base);

Organization.db_blueprint = {
  uuid: new DbField(null, ['unique']),
  org_number: new DbField(),
  name: new DbField(),
  email: new DbField(),
  phone: new DbField(),
  description: new DbField()
}



module.exports = Organization
