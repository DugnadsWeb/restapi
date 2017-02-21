var driver = require('../../neo4j_db')();


/*
* database base object for neo4j
* This is an attempt at abstracting away the underlying database from our model,
* so the model will work regardless of database.
* TODO needs a shitton of tests!!
*/

var db_base = function(){

  this.db_fields = {};
  this.validate = {};

  // ###########
  // methods ###
  // ###########

  // Creates the object in the database for the first time
  this.create = function(callback){
    if (this.validate(this.db_fields)){
      var query = build_create_query(this);
      var session = driver.session();
      session.run(query)
        .then((result) => {
          console.log(result);
          session.close();
          callback(200, 'Object Creaated');
        })
        .catch((err) => {
          session.close();
          callback(401, err);
          console.log(err);
        });
    }else {
      callback(400, "Object does not validate");
    }
  }


  // gets the object
  // requires that the object has at least one unique field!
  this.read = function(callback){
    var query = build_get_query(this);
    console.log(query);
    var session = driver.session();
    session.run(query)
      .then((result) => {
        session.close();
        if (!!result.records.length != 0){
          console.log(result.records);
          callback(200, result.records[0]._fields[0].properties);
        }else{
          callback(404, "email or password missmatch");
        }
      })
      .catch((err) => {
        session.close();
        callback(400, err);
      });
  }

  // updates the object
  this.update = function(callback){
      var query = build_update_query(this);
      var session = driver.session();
      session.run(query)
        .then(() => {
          session.close();
          callback(200, 'Object updated');
        })
        .catch((err) => {
          session.close();
          callback(400, err);
        });
  }

  // delete the object
  this.delete = function(callback){
    var query = build_match_clause(this) + " delete a";
    console.log(query);
    var session = driver.session();
    session.run(query)
      .then(() => {
        session.close();
        callback(200, this.constructor.name + " was deleted");
      })
      .catch((err) => {
        session.close();
        callback(400, err);
      });
  }


  // builds the create query for the object
  function build_create_query(me){
    var query = "CREATE (a:" + me.constructor.name + " { "
    for (var field in me.db_fields){
        query += field + ": '" + me.db_fields[field].data + "',";
    }
    return query.substring(0, query.length-1) + "})";
  }

  // builds the get query
  // requires that the object has at least one unique field!
  function build_get_query(me){
    var query = build_match_clause(me);
    query += "RETURN a";
    return query;
  }

  // builds the set query for the object
  function build_update_query(me){
    var query = build_match_clause(me);
    query = " SET ";
    for (var field in me.db_fields){
      if (typeof me.db_fields[field] !== 'undefined'){
        query += "a." + field + " = \"" + me.db_fields[field].data + "\",";
      }
    }
    return query.substring(0, query.length-1);
  }

  // builds the match clause
  function build_match_clause(me){
    // find object to edit
    var query = "MATCH (a:" + me.constructor.name + " {";
    for (var field in me.db_fields){
      if (typeof me.db_fields[field] !== 'undefined'){
        for (var i in me.db_fields[field].meta){
          if (me.db_fields[field].meta[i] == 'unique' ||
            me.db_fields[field].meta[i] == 'use'){
            query += field + ": \"" + me.db_fields[field].data + "\",";
          }
        }
      }
    }
    return query.substring(0, query.length-1) + "})";
  }


// end of db_base
}

db_base.read_all_from_class = function(class_name, callback) {
  var query = "MATCH (a:" + class_name + ") RETURN a";
  var session = driver.session();
  console.log("yolo");
  session.run(query)
    .then((result) => {
      session.close();
      var ret = [];
      console.log(result);
      for (var i in result.records) {
        ret.push(result.records[i]._fields[0].properties);
      }
      callback(200, ret);
    })
    .catch((err) => {
      session.close();
      callback(400, err);
    });
}

module.exports = db_base;
