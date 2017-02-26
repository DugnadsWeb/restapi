var RelationshipBase = require("./relationship_base.js");
var DbField = require("../db_field")


var Member = function(args) {
  RelationshipBase.call(this);

  this.db_fields = {
    joined_date: new DbField(),
    is_admin: new DbField()
  }

  _init(this, args);

  function _init(me, args){
      if (!args){
        me.db_fields.joined_date = new DbField(Date.now());
        me.db_fields.is_admin = new DbField(false);
      } else {
        for (field in me.db_fields){
          me.db_fields[field].data = args[field];
        }
      }
  }


}

Object.assign(Member, RelationshipBase);



module.exports = Member;
