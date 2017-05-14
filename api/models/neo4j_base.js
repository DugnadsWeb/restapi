var driver = require('../../neo4j_db')();


/*
* database base object for neo4j
* This is an attempt at abstracting away the underlying database from our model,
* so the model will work regardless of database.
* TODO needs a shitton of tests!!
*/

var db_base = function(){


  // these propperties are overwritten by subclass
  this.db_fields = {};
  this.validate = () => {return ture};

  // ###########
  // methods ###
  // ###########


  // Get db_fields
  this.get_db_fields = function(){
    ret = {};
    for (field in this.db_fields){
      ret[field] = this.db_fields[field].data;
    }
    return ret;
  }

  // Creates the object in the database for the first time
  this.create = function(){
    return new Promise((res, rej) => {
      if (this.validate(this.db_fields)){
        var query = "CREATE " + this.make_query_object('a', {use_all: true}) +
          " RETURN a";
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
      console.log(query);
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
      var query = "MATCH " + this.make_query_object('a') +
       " DELETE a RETURN id(a)";
      var session = driver.session();
      session.run(query)
        .then((result) => {
          session.close();
          if (result.records.length == 1){
            res(this.constructor.name + " was deleted");
          }
          else if (result.records.length == 0){
            rej(this.constructor.name + " not found");
          } else {
            rej("Multiple " + this.constructor.name + " deleted. Something is wrong!");
          }
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
      let query = "(" + (!!tag ? tag : '') + ":" + this.lable + " { ";
      for (var field in this.db_fields){
        if (this.db_fields[field].data !== undefined && this.db_fields[field].data !== null){
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
      if (!!me.db_fields[field].data || typeof me.db_fields[field].data == 'boolean'){
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
      if (result.records.length == 0){
        rej("No results found");
      } else if (result.records[0].length == 1){
        let ret = result.records[0]._fields[0].properties;
        ret.labels = result.records[0]._fields[0].labels;
        res(ret);
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
  let bp = new this.db_blueprint();
  for (prop in bp){
      if (bp[prop].meta.includes("unique")){
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
      if (this.db_fields[field].data !== undefined && this.db_fields[field].data !== null){
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
      console.log(err);
      rej(err);
    })
  })
}

module.exports = db_base;
