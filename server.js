// =======================
// get the packages we need ============
// =======================
var express     = require('express');
var app         = express();
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var neo4j       = require('./neo4j_db');

var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./config'); // get our config file
var apiRoutes = require('./api/api_routes');

// =======================
// configuration =========
// =======================
var port = config.port; // used to create, sign, and verify tokens
global.conf = config;
// init database driver
dbDriver = neo4j();


// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({limit: '50mb'}));

// disable 304
app.disable('etag');


// use morgan to log requests to the console
app.use(morgan('dev'));

// =======================
// routes ================
// =======================
// basic route
app.get('/', function(req, res) {
    res.send('Hello! The API is at http://localhost:' + port + '/api');
});

// API ROUTES -------------------
app.use('/api', apiRoutes);

// =======================
// start the server ======
// =======================
app.listen(port, function(){
    console.log('Server is up and running at http://localhost:' + port);
});


module.exports = app; // for teting
