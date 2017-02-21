var Db_base = require('./neo4j_base.js');
var DbField = require('./db_field.js');
var is_undefined = require('../helpers/is_undefined.js');
var RequiredArgumentExeption = require('../exceptions/required_argument_exception.js');

/*
* This is the base user object.
* TODO email is currently a unique selector, migth need to use ids instead.
* TODO possible deprecated Buffer from hashing
* TODO password is returned with user, possible fix: add noreturn meta tag
*/
var User = function(arg){
  //Db_base.call(this);



	function hash_pw(pw)
	{
			const crypto = require('crypto');
			var pw = pw;
			var salt = crypto.randomBytes(32).toString('hex');
			var hash = crypto.createHash('md5', salt).update(pw).digest('hex');
			return hash;
	}

	function hashPasswordWithSalt(pw, email)
	{
		const crypto = require('crypto');
		var iterations = 10000;

		var hash = crypto.pbkdf2Sync(pw, email, iterations, 128, 'sha512');
		return hash.toString('hex');

	}

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

      }
      else if(field === 'password'){
      	if(typeof args.password !== 'string')
      	{
      		throw new  RequiredArgumentExeption("Ugyldig passord")
      	}
      	else
      	{

      	fields.password = new DbField(hashPasswordWithSalt(args[field], args.email));
      	}

      }
      else
      {

        if (is_undefined(args[field])){fields[field] = new DbField(null, [])}
        else {fields[field] = new DbField(args[field], [])}
      }
    }
  }


// end of user
}

Object.assign(User, Db_base);

// static fields for user





// exports user;
module.exports = User;
