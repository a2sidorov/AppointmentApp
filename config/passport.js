'use strict';

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');
const Business = require('../models/business');
const getHolidays = require('./googleapi');

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
                getHolidays((events) => {
                if (req.body.isBusiness === 'on') {
                  let newUser = new Business();
                  newUser.local.username = username;
                  newUser.local.email = req.body.email;
                  newUser.local.password = newUser.generateHash(password);
                  newUser.firstname = req.body.firstname;
                  newUser.lastname = req.body.lastname;

                  for (let d = 0; d <= 6; d++) {
                    if (d >= 1 && d <= 5) {
                      newUser.workdays.push({dayNum: d.toString(), isAvailable: true});
                    } else {
                      newUser.workdays.push({dayNum: d.toString(), isAvailable: false});
                    }     
                  }

                  for (let h = 0; h <= 24; h++) {
                    if (h >= 8 && h <= 17) {
                      newUser.workhours.push({time:`${h}:00`, isAvailable: true});
                      newUser.workhours.push({time:`${h}:30`, isAvailable: false});
                    } else {
                      if (h !== 0) {
                        newUser.workhours.push({time:`${h}:00`, isAvailable: false});
                      }
                      if (h === 24) break;
                      newUser.workhours.push({time:`${h}:30`, isAvailable: false});
                    }     
                  } 
                  events.forEach((event) => {
                    event.isAvailable = false;
                  });
                  newUser.holidays = events;
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

