'user strict';

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').load();
}
const express = require('express');
const app = express();
let port = process.env.PORT || 3000;
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
const favicon = require('serve-favicon');
const path = require('path');
const morgan = require('morgan');
const winston = require('./config/winston');

//mongoose.connect('mongodb://localhost/mydb');
//mongoose.connect('mongodb+srv://test1:noldor1986@cluster0-fwxgm.mongodb.net/test?retryWrites=true/mydb', { useNewUrlParser: true });
mongoose.connect('mongodb://localhost:27017/mydb', { useNewUrlParser: true });

require('./config/passport')(passport);
require('./config/scheduler');

app.set('view engine', 'ejs');
//app.set('views', __dirname + '/views');
app.set('/views', path.join(__dirname, 'views')); 

app.use('/public', express.static(path.join(__dirname, '/public')))
//app.use('/:username/public', express.static(path.join(__dirname, '/public')))
app.use(favicon(path.join(__dirname, '/public/font/favicon.ico')));
app.use(morgan('dev'));
//app.use(morgan('combined', { stream: winston.stream }));
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
require('./config/routes.js')(app, passport);

//app.use((err, req, res, next) => {
//  console.error(err.message);
//  if (!err.statusCode) err.statusCode = 500;
//  res.status(err.statusCode).send('Something broke!');
//});.
app.use(function(err, req, res, next) {
//  console.log(req.headers['content-type'] === 'application/json');
  //winston.error(err);
  console.error(err);
//  console.log(req.headers);
  if (req.headers['content-type'] === 'application/json') {
    return res.json({
      error: true,
      message: `Server error ${err.status || 500} `  
    });
  }
//  } else if (req.headers['content-type'] === 'text/html') {
//    res.json({
//      error: true,
//      message: `works`  
//    });
//    
  res.redirect(`/error/${err.status || 500}`);

//  winston.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
//  res.status(err.status || 500);
//});.
});

app.listen(port, () => {
	console.info(`listening on port ${port}`);
});

module.exports = app; // for testing

