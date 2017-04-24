var Db_base = require('./neo4j_base.js');
var DbField = require('./db_field.js');
var RequiredArgumentExeption = require('../exceptions/required_argument_exception.js');

/*
* This is the base user object.
* TODO email is currently a unique selector, migth need to use ids instead.
* TODO possible deprecated Buffer from hashing
* TODO password is returned with user, possible fix: add noreturn meta tag
*/
var User = function(arg){
  Db_base.call(this);


  this.type = "User";
  // User propperties
  this.db_fields = new User.db_blueprint();

  // Initiates user
  _init(this, arg);


  // User creation validation
  // TODO add regex checks
  this.validate = function(db_fields){
    if(db_fields.firstName.data.length > 2 &&
      db_fields.lastName.data.length > 2 &&
      db_fields.password.data.length > 5 &&
      db_fields.email.data.length > 5){
        return true;
      }
    return false;
  };


  function _init(me, args) {
    var fields = me.db_fields;
    for (field in fields){
      if(field === 'password'){
      	if(typeof args.password === 'string'){
      	   let password = hashPasswordWithSalt(args[field], args.email);
           fields.password.data = password
      	}
      } else if (field in args){
        fields[field].data = args[field];
      }
    }
  }

  function hashPasswordWithSalt(pw, email)
  {
    const crypto = require('crypto');
    var iterations = 10000;

    var hash = crypto.pbkdf2Sync(pw, email, iterations, 128, 'sha512');
    return hash.toString('hex');

  }

// end of user
}

User.db_blueprint = function (){
  this.firstName = new DbField();
  this.lastName = new DbField();
  this.email = new DbField(null, ['unique']);
  this.password = new DbField();
}

Object.assign(User, Db_base);

// static fields for user


// exports user;
module.exports = User;
