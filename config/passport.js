'use strict';

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');
const Business = require('../models/business');
const holidays = require('./googleapi');

module.exports = function (passport) {

	passport.serializeUser(function(user, done) {
		done(null, user.id);
	});

	passport.deserializeUser(function(id, done) {
		User.findById(id, (err, user) => { 
			done(err, user);
		});
	});

  passport.use('local-signup', new LocalStrategy({
  	passReqToCallback : true
  },
  	function(req, username, password, done) {
      if (password !== req.body.confirm) {
        return done(null, false, req.flash('signupMessage', 'Password does not match the confirm password.'));
      } else {
        User.findOne({ 'local.username' :  username }, function(err, user) {
          if (err) return done(err);
          if (user) return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
          else {
            User.findOne({ 'local.email': req.body.email }, function(err, email) {
              if (err) return done(err);
              if (email) return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
              else {
                holidays((data) => {
                if (req.body.isBusiness === 'on') {
                  let newUser = new Business();
                  newUser.local.username = username;
                  newUser.local.email = req.body.email;
                  newUser.local.password = newUser.generateHash(password);
                  newUser.firstname = req.body.firstname;
                  newUser.lastname = req.body.lastname;
                  newUser.workdays = ['Mo', 'Tu', 'We', 'Th', 'Fr'];
                  newUser.workhours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
                  newUser.holidays = data.map(event => {return event.date}); 
                  newUser.exceptionDates = [`${new Date().getFullYear()}-05-04`];
                  newUser.save(function(err) {
                    if (err) throw err;
                    return done(null, newUser);
                  });
                } else {
                  let newUser = new User();
                  newUser.local.username = username;
                  newUser.local.email = req.body.email;
                  newUser.local.password = newUser.generateHash(password);
                  newUser.firstname = req.body.firstname;
                  newUser.lastname = req.body.lastname;
                  newUser.save(function(err) {
                    if (err) throw err;
                    return done(null, newUser);
                  });
                }
              })
            }
            });
          }  
        });
      }
    }));

  passport.use('local-login', new LocalStrategy({
  	passReqToCallback : true
  },
  	function(req, username, password, done) { 
  		User.findOne({ 'local.username' :  username }, function(err, user) {
  			if (err) return done(err);
  			else if (!user) {
  				User.findOne({ 'local.email' : username }, function(err, user) {
            console.log('user: ' + user);
  					if (err) return done(err);
  					else if (!user) {
  						return done(null, false, req.flash('loginMessage', 'No user found.'));
  					} else if (!user.validPassword(password)) {
  						return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
  					} else return done(null, user);
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

