var Db_base = require('./neo4j_base.js');
var DbField = require('./db_field.js');
var is_undefined = require('../helpers/is_undefined.js');
var RequiredArgumentExeption = require('../exceptions/required_argument_exception.js');

/*
* This is the base user object.
* TODO email is currently a unique selector, migth need to use ids instead.
* TODO password is not hashed
* TODO password is returned with user, possible fix: add noreturn meta tag
*/
var User = function(arg){
  Db_base.call(this);


  // User propperties
  this.db_fields = {
    first_name: null,
    last_name: null,
    email: null,
    password: null,
  };

  // Initiates user
  _init(this, arg);


  // User creation validation
  this.validate = function(db_fields){
    if(db_fields.first_name.data.length > 2 &&
      db_fields.last_name.data.length > 2 &&
      db_fields.password.data.length > 5 &&
      db_fields.email.data.length > 5){
        return true;
      }
    return false;
  };

  // private functions
  function _init(me, args) {
    var fields = me.db_fields;
    for (field in fields){
      if (field === 'email'){
        if (typeof args.email !== 'string'){
          throw new  RequiredArgumentExeption("The email field of user is missing")
        } else {fields.email = new DbField(args.email, ['unique'])}
      }else{

        if (is_undefined(args[field])){fields[field] = new DbField(null, [])}
        else {fields[field] = new DbField(args[field], [])}
      }
    }
  }


// end of user
}



// exports user;
module.exports = User;
