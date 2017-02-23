var RelationshipBase = require("./relationship_base.js");
var DbField = require("../db_field")


var Applied = function() {
  RelationshipBase.call(this);

  this.db_fields = {
    status: new DbField(),
    applied_date: new DbField(),
  }

}

Object.assign(Applied, RelationshipBase);



module.exports = Applied;
