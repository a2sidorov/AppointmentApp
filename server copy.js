'use strict';

const express = require('express'), //+
app = express(), //+
morgan = require('morgan'); //+

const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
const favicon = require('serve-favicon');
const path = require('path');

let port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1',
    mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/mydb',
    mongoURLLabel = "";

if (mongoURL == null) {
  var mongoHost, mongoPort, mongoDatabase, mongoPassword, mongoUser;
  // If using plane old env vars via service discovery
  if (process.env.DATABASE_SERVICE_NAME) {
    var mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase();
    mongoHost = process.env[mongoServiceName + '_SERVICE_HOST'];
    mongoPort = process.env[mongoServiceName + '_SERVICE_PORT'];
    mongoDatabase = process.env[mongoServiceName + '_DATABASE'];
    mongoPassword = process.env[mongoServiceName + '_PASSWORD'];
    mongoUser = process.env[mongoServiceName + '_USER'];

  // If using env vars from secret from service binding  
  } else if (process.env.database_name) {
    mongoDatabase = process.env.database_name;
    mongoPassword = process.env.password;
    mongoUser = process.env.username;
    var mongoUriParts = process.env.uri && process.env.uri.split("//");
    if (mongoUriParts.length == 2) {
      mongoUriParts = mongoUriParts[1].split(":");
      if (mongoUriParts && mongoUriParts.length == 2) {
        mongoHost = mongoUriParts[0];
        mongoPort = mongoUriParts[1];
      }
    }
  }

  if (mongoHost && mongoPort && mongoDatabase) {
    mongoURLLabel = mongoURL = 'mongodb://';
    if (mongoUser && mongoPassword) {
      mongoURL += mongoUser + ':' + mongoPassword + '@';
    }
    // Provide UI label that excludes user id and pw
    mongoURLLabel += mongoHost + ':' + mongoPort + '/' + mongoDatabase;
    mongoURL += mongoHost + ':' +  mongoPort + '/' + mongoDatabase;
  }
}

// Connect to mongodb via mongoose
let db = null;
let initDb = function(callback) {
  if (mongoURL == null) return;

  let connect = function () {
    console.log(mongoURL);
    mongoose.connect(mongoURL, { useNewUrlParser: true });
  };
  connect();

  db = mongoose.connection;

  db.on('error', function(error){
    callback(err);
    console.log("Error loading the db - "+ error);
  });

  db.on('disconnected', connect);
};

if (!db) {
  initDb(function(err){});
}

//mongoose.connect('mongodb://localhost:27017/mydb', { useNewUrlParser: true });

require('./config/passport')(passport);
require('./config/scheduler');

app.set('view engine', 'ejs');
app.set('/views', path.join(__dirname, 'views')); 

app.use('/public', express.static(path.join(__dirname, '/public')))
app.use(favicon(path.join(__dirname, '/public/font/favicon.ico')));
app.use(morgan('combined'));
app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({ 
	secret: 'abcd1234',
	resave: true,
	saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
require('./config/routes')(app, passport);

// error handling
app.use(function(err, req, res, next) {
  console.error(err);
  if (req.headers['content-type'] === 'application/json') {
    return res.json({
      error: true,
      message: `Server error ${err.status || 500}`  
    });
  }
  res.redirect(`/error/${err.status || 500}`);
});

app.listen(port, ip); //+
console.log('Server running on http://%s:%s', ip, port);//+

module.exports = app; //+

