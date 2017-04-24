var DbField = require('./db_field.js');
var uuid = require('uuid/v4');
var Activity = require('./activity.js');


/**

    This is just a test to see if inheritance of neo4j_base children will work.
    And it does!

**/


var SalesActivity = function(args){
  Activity.call(this, args);



  this.type = this.type + ':SalesActivity';
  this.db_fields = Object.assign({}, this.db_fields, new SalesActivity.db_blueprint());

  //


  function _init(args){
    let tmp_blueprint = new SalesActivity.db_blueprint();
    for (arg in args){
      if(arg in tmp_blueprint){
        this.db_fields[arg].data = args[arg];
      }
    }
  }


}





Object.assign(SalesActivity, Activity);

SalesActivity.db_blueprint = function(){
  this.salesArticle = new DbField("");
}

module.exports = SalesActivity;
