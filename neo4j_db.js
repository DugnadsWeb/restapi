var neo4j = require('neo4j-driver').v1;
var conf = require('./config').database;

// creates and returns a database driver
var db
module.exports = function() {

    auth = neo4j.auth.basic(conf.user, conf.pw);
    db = neo4j.driver(conf.server, auth);

    return db;
}
