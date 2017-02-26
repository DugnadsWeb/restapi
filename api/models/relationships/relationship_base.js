



var RelationshipBase = function(){

  this.db_fields = {}


  // options: use_all - uses all defined object fields
  this.make_query_object = function (tag, options){
    options = !!options ? options : {}
    let query = "[" + (!!tag ? tag : '') + ":" + this.constructor.name + " { ";
    for (var field in this.db_fields){
      if (!!this.db_fields[field].data){
        if (this.db_fields[field].meta.indexOf('unique') != -1 ||
          this.db_fields[field].meta.indexOf('use') != -1 ||
          options.use_all){
          query += field + ": \"" + this.db_fields[field].data + "\",";
        }
      }
    }
    return query.substring(0, query.length-1) + "}]";
  }


}


module.exports = RelationshipBase;
