



var RelationshipBase = function(){

  this.db_fields = {}


  // options: use_all - uses all defined object fields
  this.make_query_object = function (tag, options){
    console.log("relation make_query_object called");
    options = !!options ? options : {}
    let query = "[" + (!!tag ? tag : '') + ":" + this.constructor.name + " { ";
    for (var field in this.db_fields){
      console.log(field);
      if (typeof this.db_fields[field] !== 'undefined'){
        for (var i in this.db_fields[field].meta){
          if ((this.db_fields[field].meta[i] == 'unique' ||
            this.db_fields[field].meta[i] == 'use' ||
            options.use_all) && !!this.db_fields[field].data){
            query += field + ": \"" + this.db_fields[field].data + "\",";
          }
        }
      }
    }
    return query.substring(0, query.length-1) + "}]";
  }


}


module.exports = RelationshipBase;
