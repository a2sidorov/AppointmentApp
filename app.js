const express = require('express');
const app = express();
let port = process.env.PORT || 3000;
const morgan = require('morgan');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');

mongoose.connect('mongodb://localhost/mydb');

require('./config/passport')(passport);

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.use('/public', express.static('public'));
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({ 
	secret: 'secret',
	resave: true,
	saveUninitialized: true

}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

require('./config/routes.js')(app, passport);

app.listen(port, () => {
	console.log(`listening on port ${port}`);
});

