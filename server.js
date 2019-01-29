'use strict';

const express = require('express'),
app = express(),
mongoose = require('mongoose'),
morgan = require('morgan');

app.use(morgan('dev'));

const errorLog = require('./config/logger').errorLog;
const infoLog = require('./config/logger').infoLog;

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const session = require('express-session');

const flash = require('connect-flash');
const favicon = require('serve-favicon');
const path = require('path');

/* Heroku server set up */

let port, mongoURI;

if (process.env.NODE_ENV == 'production') {
  console.log("PRODUCTION");
  infoLog.info("PRODUCTION");
  port = process.env.PORT || 5000;
  mongoURI = "mongodb+srv://a2sidorov:" + process.env.DB_PASSWORD + "@cluster0-bvs0n.mongodb.net/test?retryWrites=true";
  infoLog.info("Connectiong to " + mongoURI);
} else {
  console.log("DEVELOPMENT");
  infoLog.info("DEVELOPMENT");
  require('dotenv').load();
  port = 8080;
  mongoURI = 'mongodb://localhost:27017/mydb';
}

// Connecting to mongoDB cluster
mongoose.connect(mongoURI, { useNewUrlParser: true }, err => {
  if (err) {
    if (process.env.NODE_ENV == 'production') {
      errorLog.error(err);
    } else {
      console.error(err);
    }
  }
});

//let db = mongoose.connection;
//db.on('error', console.error.bind(console, 'mongoose: connection error'));
mongoose.connection.once('open', function() {
  if (process.env.NODE_ENV == 'production') {
    infoLog.info('Connected to DB successfully');
  } else {
    console.info('Connected to DB successfully');
  }  
});

require('./config/passport')(passport);
require('./config/scheduler');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use('/public', express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({ 
	secret: process.env.SECRET_KEY,
	resave: true,
	saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
require('./config/routes')(app, passport);

// error handling
app.use(function(err, req, res, next) {
  console.error(err);
  if (process.env.NODE_ENV === 'production') {
    errorLog.error(err);
  }
  if (req.headers['content-type'] === 'application/json') {
    return res.json({
      error: true,
      message: `Server error ${err.status || 500}`  
    });
  }
  res.redirect(`/error/${err.status || 500}`);
});

app.listen(port, () => console.log(`Listening on ${ port }`))

module.exports = app;