'use strict';

const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');
const Business = require('../models/business');

module.exports = function(passport) {
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  passport.deserializeUser(function(id, done) {
    User.findById(id, (err, user) => { 
      done(err, user);
    });
  });
  passport.use('local-signup', new LocalStrategy({
    passReqToCallback: true,
    usernameField: 'email',
    passwordField: 'password',
  },
    async function(req, username, password, done) {
      try {
        const user = await User.findOne({ 'local.email': username });
        if (user) return done(null, false, 'This email is alredy signed up');
        if (req.body.isBusiness) {
          const newBusiness = new Business();
          newBusiness.local.email = username;
          newBusiness.local.password = newBusiness.generateHash(password);
          newBusiness.local.timezoneOffsetMs = req.body.timezoneOffsetMs;
          //newBusiness.holidays = await holidays.readFromFile();
          await newBusiness.setHolidays();
          await newBusiness.save();
          return done(null, newBusiness);
        } else {
          const newUser = new User();
          newUser.local.email = username;
          newUser.local.password = newUser.generateHash(password);
          newUser.local.timezoneOffsetMs = req.body.timezoneOffsetMs;
          newUser.save();
          return done(null, newUser);
        }
      } catch(err) {
        return done(err);
      }
    } 
  ));
  passport.use('local-login', new LocalStrategy({
    usernameField: 'email',
    passReqToCallback: true,
  },
    async function(req, username, password, done) {
      try {
        const user = await User.findOne({ 'local.email': username });
        if (!user) return done(null, false, 'No user found.');
        if (!user.validPassword(password)) return done(null, false, 'Oops! Wrong password.');
        return done(null, user);
      } catch(err) {
        return done(err);
      }
    } 
  ));
}

