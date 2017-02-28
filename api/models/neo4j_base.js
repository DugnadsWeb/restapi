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
  this.create = function(){
    return new Promise((res, rej) => {
      if (this.validate(this.db_fields)){
        var query = "CREATE " + this.make_query_object('a', {use_all: true});
        var session = driver.session();
        session.run(query)
          .then((result) => {
            session.close();
            res(result);
          })
          .catch((err) => {
            session.close();
            rej(err);
          });
      }else {
        rej(this.constructor.name + " did not validate");
      }
    });
  }

  // gets the object
  // requires that the object has at least one unique field!
  // @deprecated use db_base.get_unique
  this.read = function(callback){
    var query = "MATCH " + this.make_query_object('a');
    var session = driver.session();
    session.run(query)
      .then((result) => {
        session.close();
        if (!!result.records.length != 0){
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
  // TODO need to test and approve edit data. proposal: make validate_update method
  this.update = function(edited_object){
    return new Promise((res, rej) => {
      var query = "MATCH " + this.make_query_object('a') +
        build_update_query(edited_object);
      var session = driver.session();
      session.run(query)
        .then(() => {
          session.close();
          res(this.constructor.name + ' updated');
        })
        .catch((err) => {
          session.close();
          rej(err);
        });
    });
  }

  // delete the object
  this.delete = function(){
    return new Promise((res, rej) => {
      var query = "MATCH " + this.make_query_object('a') + " delete a";
      var session = driver.session();
      session.run(query)
        .then(() => {
          session.close();
          res(this.constructor.name + " was deleted");
        })
        .catch((err) => {
          session.close();
          rej(err);
        });
    });
  }


  // TODO try to abstract this to sql if possible
  // arg: relationship ie join table in sql
  this.get_realations_of_type = function(type, relationship){
      return new Promise((res, rej) => {
        query = "MATCH " + this.make_query_object('a') +
        "-" + relationship.make_query_object('b', {use_all: true}) + "-(c:" + type + ") return b, c";
        let session = driver.session();
        console.log(query);
        session.run(query)
        .then((result) => {
          session.close();
          let ret = [];
          for (let i=0; i < result.records.length;i++){
            let field = {};
            field[relationship] = result.records[i]._fields[0].properties;
            field[type] = result.records[i]._fields[1].properties;
            ret.push(field);
          }
          res(ret);
        })
        .catch((err) => {
          session.close();
          rej(err);
        })
      });
  }


  this.create_relation = function(relate_object, relationship, options){
    return new Promise((res, rej) => {
      query = create_relation_query(this, relate_object, relationship, options);
      session = driver.session();
      session.run(query)
        .then(() => {
          session.close();
          res();
        })
        .catch((err) => {
          session.close();
          rej(err);
        });
    });
  }

  // options: use_all - uses all defined object fields
  this.make_query_object = function (tag, options){
      options = !!options ? options : {}
      let query = "(" + (!!tag ? tag : '') + ":" + this.constructor.name + " { ";
      for (var field in this.db_fields){
        if (!!this.db_fields[field].data){
          if (this.db_fields[field].meta.indexOf('unique') != -1 ||
            this.db_fields[field].meta.indexOf('use') != -1 ||
            options.use_all){
            query += field + ": \"" + this.db_fields[field].data + "\",";
          }
        }
      }
      return query.substring(0, query.length-1) + "})";
    }

  // builds the set query for the object
  function build_update_query(me){
    query = " SET ";
    for (field in me.db_fields){
      if (!!me.db_fields[field].data){
        query += "a." + field + " = \"" + me.db_fields[field].data + "\",";
      }
    }
    return query.substring(0, query.length-1);
  }


  // options: unique - Creates a relationship if one does not all ready exists
  function create_relation_query(me, relate_object, relationship, options){
    options = !!options ? options : {};
    query = "MATCH" + me.make_query_object('a') + ", " +
      relate_object.make_query_object('b');
      console.log(relationship);
    query += " CREATE " + (options.unique ? "UNIQUE" : "") +
      " (a)-" + relationship.make_query_object('r', {use_all: true}) + "->(b) return r";
    console.log(query);
    return query;
  }

// end of db_base
}

db_base.read_all_from_class = function(callback) {
  var query = "MATCH (a:" + this.name + ") RETURN a";
  var session = driver.session();
  session.run(query)
    .then((result) => {
      session.close();
      var ret = [];
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


db_base.get_unique = function(unique_id){
  return new Promise((res, rej) => {
    query = this._get_from_unique_identifier_query(unique_id);
    session = driver.session();
    session.run(query)
    .then((result) => {
      session.close();
      //console.log(result.records[0]._fields[0].properties);
      if (result.records[0].length == 1){
        res(result.records[0]._fields[0].properties);
      } else if (result.records.length == 0){
        rej("No results found");
      } else {
        rej("Multiple results found; something is seriously wrong");
      }
    })
    .catch((err) => {
      session.close();
      rej(err);
    })
  })
}

db_base._get_from_unique_identifier_query = function(id){
  query = "MATCH (a:" + this.name + "{ "

  for (prop in this.db_blueprint){
      if (this.db_blueprint[prop].meta.includes("unique")){
        query += prop + ": \"" + id + "\"";
      }
    }
  query += " }) RETURN a";
  return query;
}

db_base.blueprint = {};


db_base.make_query_object = function (tag, options){
    options = !!options ? options : {}
    let query = "(" + (!!tag ? tag : '') + ":" + this.constructor.name + " { ";
    for (var field in this.db_fields){
      if (!!this.db_fields[field].data){
        if (this.db_fields[field].meta.indexOf('unique') != -1 ||
          this.db_fields[field].meta.indexOf('use') != -1 ||
          options.use_all){
          query += field + ": \"" + this.db_fields[field].data + "\",";
        }
      }
    }
    return query.substring(0, query.length-1) + "})";
  }

db_base.custom_query = function(query){
  return new Promise((res, rej) => {
    let session = driver.session();
    session.run(query)
    .then((result) => {
      session.close();
      res(result);
    })
    .catch((err) => {
      session.close();
      rej(err);
    })
  })
}

module.exports = db_base;
