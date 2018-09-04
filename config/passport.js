'use strict';

const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');
const Business = require('../models/business');
const holidays = require('./holidays');

module.exports = function(passport) {
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  passport.deserializeUser(function(id, done) {
    User.findById(id, (err, user) => { 
      done(err, user);
    });
  });
  //  passport.use('local-signup', new LocalStrategy({
  //    passReqToCallback : true
  //  },
  //    function(req, email, password, done) {
  //      console.log('workinggggggggggggggggg');
  //      User.findOne({ 'local.email': email }, (err, user) => {
  //        if (err) return done(err);
  //        if (user) return done(null, false, req.flash('signupMessage', 'The entered email is already signed up.'));
  //        if (req.body.isBusiness === 'on') {
  //          const newBusiness = new Business();
  //          newBusiness.local.email = req.body.email;
  //          newBusiness.local.password = newBusiness.generateHash(password);
  //          holidays.readFromFile
  //            .then(data => {
  //              newBusiness.holidays = data;
  //              newBusiness.save((err) => {
  //                if (err) return done(err);
  //                return done(null, newBusiness);
  //              });
  //            })
  //            .catch(err => logger.error(err));
  //        } else {
  //          const newUser = new User();
  //          newUser.local.email = req.body.email;
  //          newUser.local.password = newUser.generateHash(password);
  //          newUser.save((err) => {
  //            if (err) done(err);
  //            return done(null, newUser);
  //          });
  //        }
  //      });
  //    }
  //  ));
  passport.use('local-signup', new LocalStrategy({
    passReqToCallback: true,
    usernameField: 'email',
    passwordField: 'password',
  },
    async function(req, username, password, done) {
      try {
        throw new Error('Test error');
        const user = await User.findOne({ 'local.email': username });
        if (user) return done(null, false, 'This email is alredy signed up');
        if (req.body.isBusiness === 'on') {
          const newBusiness = new Business();
          newBusiness.local.email = username;
          newBusiness.local.password = newBusiness.generateHash(password);
          newBusiness.holidays = await holidays.readFromFile();
          await newBusiness.save();
          return done(null, newBusiness);
        } else {
          const newUser = new User();
          newUser.local.email = username;
          newUser.local.password = newUser.generateHash(password);
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
        //throw new Error('Test error');
        const user = await User.findOne({ 'local.email': username });
        if (!user) return done(null, false, 'No user found.');
        if (!user.validPassword(password)) return done(null, false, 'Oops! Wrong password.');
        return done(null, user);
      } catch(err) {
        return done(err);
      }
    } 
    //    function(req, username, password, done) {
    //      User.findOne({ 'local.email': username }, (err, user) => {
    //        if (err) return done(err);
    //        if (!user) return done(null, false, 'No user found.');
    //        if (!user.validPassword(password)) return done(null, false, 'Oops! Wrong password.');
    //        return done(null, user);
    //      });
    //    } 
  ));
  //  passport.use('local-login', new LocalStrategy({
  //    passReqToCallback : true
  //  }, function(req, email, password, done) {
  //    console.log('working22222'); 
  //    console.log(email);
  //    User.findOne({ 'local.email': email }, (err, user) => {
  //      if (err) return done(err);
  //      console.log('working22222');
  //      if (!user) return done(null, false, req.flash('loginMessage', 'No user found.'));
  //      if (!user.validPassword(password)) return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
  //      return done(null, user);
  //    });
  //  }
  //  ));
  //  passport.use('local-signup', new LocalStrategy({
  //    passReqToCallback : true
  //  }, function(req, email, password, done) { 
  //    console.log('working2111111111111111111111');
  //    console.log(email);
  //    User.findOne({ 'local.email': email }, (err, user) => {
  //      if (err) return done(err);
  //      if (user) return done(null, false, req.flash('signupMessage', 'The entered email is already signed up.'));
  //      const newUser = new User();
  //      newUser.local.email = email;
  //      newUser.local.password = newUser.generateHash(password);
  //      newUser.save((err, result) => {
  //        if (err) return done(err);
  //        return done(null, result);
  //      });
  //    });
  //  }
  //  ));
}

