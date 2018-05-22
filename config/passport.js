const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');

module.exports = function(passport){
	passport.serializeUser(function(user, done) {
				done(null, user.id);
		});
		passport.deserializeUser(function(id, done) {
				User.findById(id, function(err, user) {
						done(err, user);
				});
		});

passport.use('local-signup', new LocalStrategy({
	passReqToCallback : true
},
	function(req, username, password, done) {
		User.findOne({ 'local.username' :  username }, function(err, email) {
			if (err) {
				return done(err);
			}
			if (email) {
				return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
			} else {
				User.findOne({'local.email': req.body.email}, function(err, user) {
				if(err){
				return done(err);
				}
				if(user){
				return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
				} else {
					let newUser = new User();
					newUser.local.username = username;
					newUser.local.email = req.body.email;
					newUser.local.password = newUser.generateHash(password);
					newUser.save(function(err) {
						if (err) {
							throw err;
						}
						return done(null, newUser);
					});
				}
				});
			}
		});
}));
passport.use('local-login', new LocalStrategy({
	passReqToCallback : true
},
	function(req, username, password, done) { 
		User.findOne({ 'local.username' :  username }, function(err, user) {
			console.log(`${user}`);
			if (err) {
				return done(err);
			} else if (!user){
				User.findOne({ 'local.email' : username }, function(err, email) {
					if(err){
						return done(err);
					} else if(!email) {
						return done(null, false, req.flash('loginMessage', 'No user found.'));
					} else if(!email.validPassword(password)) {
						return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
					} else {
					return done(null, email);
					}
				});				
			} else if (!user.validPassword(password)) {
				return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
			} else {
				return done(null, user);
			}
		});
	}
));

};

