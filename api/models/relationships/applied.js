var RelationshipBase = require("./relationship_base.js");
var DbField = require("../db_field")


var Applied = function(args) {
  RelationshipBase.call(this);

  this.db_fields = {
    status: new DbField(),
    applied_date: new DbField(),

  }

  _init(this, args);

  function _init(me, args){
      if (!args){
        me.db_fields.status = new DbField(true, ['use']);
        me.db_fields.applied_date = new DbField(Date.now(), ['use']);
      } else {
        for (field in me.db_fields){
          me.db_fields[field].data = args[field];
        }
      }
  }


}

Object.assign(Applied, RelationshipBase);



module.exports = Applied;
