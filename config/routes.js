'use strict';

const User = require('../models/user');
const holidays = require('./googleapi');
const crypto = require('crypto');
const nodemailer = require('nodemailer');


module.exports = function(app, passport) {
	
  //init data object
  let curDate = new Date(),
  year = curDate.getFullYear(),
  month = curDate.getMonth(),
  today = curDate.getDate(),
  weekDay = (curDate.getDay() === 0) ? 7 : curDate.getDay(),
  initMonday = today - weekDay + 1,
  curMonday = today - weekDay + 1;
  let timeArr = [];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  /* GET Login page. */
  app.get('/', (req, res) => {
  	res.render('login', {
  		message: req.flash('loginMessage')
  	});
  });

  /* POST Login */
  app.post('/login', function(req, res, next) {
    passport.authenticate('local-login', function(err, user, info) {
      if (err) return next(err);
      if (!user) return res.redirect('/');
      req.logIn(user, function(err) {
        if (err) return next(err);
        if (req.body.rememberme === 'on') {
          req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
        } 
        if (req.body.rememberme !== 'on') {
          req.session.cookie.maxAge = null;
        }
        return res.redirect('/' + user.local.username);
      });
   })(req, res, next);
  });

  /* GET Password recovery page */
  app.get('/forgot', (req, res) => {
    res.render('forgot', {
      message: req.flash('info')
    });
  });

  /* POST Password recovery */
  app.post('/forgot', (req, res) => {
    User.findOne({ 'local.email': req.body.email }, (err, user) => {
      if (err) throw err;
      if (!user) {
        req.flash('info', 'No account with that email address exists.');
        res.render('forgot', {
          message: req.flash('info')
        });
      } else {
        crypto.randomBytes(20, (err, buf) => {
          if (err) throw err;
          const token = buf.toString('hex')
          user.local.resetPasswordToken = token;
          user.local.resetPasswordExpires = Date.now() + 3600000;

          user.save((err, update) => {
            if (err) throw err;
            const transporter = nodemailer.createTransport({
              service: 'gmail',
              auth: {
                user: 'a2mail4dev@gmail.com',
                pass: ''
              }
            });
            const mailOptions = {
            from: 'passwordreset@demo.com',
            to: user.local.email,
            subject: 'Appointment App Password Reset',
            text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
              'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
              'http://' + req.headers.host + '/reset/' + token + '\n\n' +
              'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };

            transporter.sendMail(mailOptions, (error, info) => {
              if (err) console.log(err); 
              else {
                req.flash('info', 'Recovery email has been sent');
                res.render('forgot', {
                message: req.flash('info')
              });
            }
          });

          });
        });
      } 
    });
  });

  /* GET Password reset page */
  app.get('/reset/:token', (req, res) => {
    User.findOne({ 'local.resetPasswordToken': req.params.token }, (err, user) => {
      if (!user) {
        req.flash('info', 'Password reset token is invalid.');
        res.redirect('/forgot');
      } else if (user.local.resetPasswordExpires < Date.now()) {
        req.flash('info', 'Password reset token is expired.')
        res.redirect('/forgot');
      } else {
        res.render('reset', {
          user: req.user,
          token: req.params.token,
          message: req.flash('info')
        });
      }
    });
  });

  /* POST Password reset */
  app.post('/reset/:token', (req, res) => {
    User.findOne({ 'local.resetPasswordToken': req.params.token }, (err, user) => {
      if (err) throw err;
      if (!user) {
        req.flash('info', 'Password reset token is invalid.');
        res.render('reset', {
          user: req.user,
          message: req.flash('info')
        });
      } else if (user.local.resetPasswordExpires < Date.now()) {
        req.flash('info', 'Password reset token is expired.')
        res.render('reset', {
          user: req.user,
          message: req.flash('info')
        });
      } else {
        user.local.password = user.generateHash(req.body.password);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        user.save((err, update) => {
          if (err) throw err;
          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'a2mail4dev@gmail.com',
              pass: ''
            }
          });
          const mailOptions = {
            from: 'passwordreset@demo.com',
            to: user.local.email,
            subject: 'Your password has been changed',
            text: 'Hello,\n\n' +
              'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
            };

          transporter.sendMail(mailOptions, (error, info) => {
            if (err) console.log(err); 
            else {
              req.flash('info', 'Success! Your password has been changed.');
              res.render('login', {
                message: req.flash('info')
              });
            }
        });
      })
    }
  });
});

  /* GET Registration Page */
  app.get('/signup',(req, res) => {
  	res.render('signup', {
  		message: req.flash('signupMessage')
  	});
  });

  /* POST Sign up */
  // app.post('/signup', passport.authenticate('local-signup', {
  // 	successRedirect : '/profile',
  // 	failureRedirect : '/signup',
  // 	failureFlash : true
  // }));
  //--------------------------------
  app.post('/signup', function(req, res, next) {
    passport.authenticate('local-signup', function(err, user, info) {
      if (err) return next(err);
      if (!user) return res.redirect('/signup');
      req.logIn(user, function(err) {
        if (err) return next(err);
        if (user.isDoctor) { 
          return res.redirect('/profile');
        } else {
          return res.redirect('/'+ user.local.username);
        }
      });
   })(req, res, next);
  });

  //--------------------------------


  /* GET Profile page */
  app.get('/profile', isLoggedIn, (req, res) => {
    holidays((data) => {
      res.render('profile', {
      user: req.user,
      allHolidays: data
    });
    });
  });

  /* POST Profile update */
  app.post('/:id', isLoggedIn, function(req, res) {
  	User.findById(req.params.id, function (err, user) {
  		if (err) return handleError(err);
  		user.workdays = req.body.workdays;
      user.times = req.body.time;
      user.exceptionTimes = req.body.exceptionTimes;
      user.holidays = req.body.holidays; 
      user.exceptionDates = req.body.exceptionDates;
  		user.save((err, update) => {
  			if (err) return handleError(err);
  			res.redirect('/profile');
  		});
  	});
  });


  /* GET Log Out */
  app.get('/logout', function(req, res){
  	req.logout();
  	res.redirect('/');
  });
  function isLoggedIn(req, res, next) {
      if (req.isAuthenticated()) {
          return next();
      }
      res.redirect('/');
  }

  /* GET Home page for patients */
  app.get('/:username', (req, res) => {
  	if (req.isAuthenticated()) {
  		User.findOne({ 'local.username': req.params.username }, (err, user) => {
  			if (err) throw err;
        res.render('patient-home', {
          username: req.params.username,
        });
      });	
    } else {
      res.redirect('/');
    }
  });

  app.get('/:username/book', (req, res) => {
    User.findOne({ 'local.username': req.params.username }, (err, user) => {
        if (err) throw err;
        res.render('patient-booking', {
          week: user.createMonthSchedule(year, month, curMonday),
          today: `${months[month]} ${today}`,
          username: req.params.username,
        });
    }); 
  });

  app.get('/:username/doctors', (req, res) => {
    User.findOne({ 'local.username': req.params.username }, (err, user) => {
        if (err) throw err;
        res.render('patient-doctors', {
          week: user.createMonthSchedule(year, month, curMonday),
          today: `${months[month]} ${today}`,
          username: req.params.username,
        });
    }); 
  });

  app.get('/:username/nextweek', (req, res) => {
  	curMonday += 7;
  	res.redirect('/'+ req.params.username);
  });
  app.get('/:username/prevweek', (req, res) => {
  	if(curMonday - 7 >= initMonday) {
  		curMonday -= 7;
  	}
  	res.redirect('/'+ req.params.username);
  });
  //---------------------------------------------------------
  // app.post('/:username/newappointment', (req, res) => {
  // 	let post = new Customer({
  // 		user: req.params.username,
  // 		name: req.body.name,
  // 		phone: req.body.phone,
  // 		email: req.body.email,
  // 		reason: req.body.reason,
  // 		ins: req.body.ins,
  // 		time: req.body.time
  // 	});
  // 	post.save(function(err){
  // 		if(err) return console.error(err);
  // 		res.redirect('/' + req.params.username);
  // 	});
  // });
  //---------------------------------------------------------
  //saving customer data into user model
  app.post('/:username/newappointment', (req, res) => {
    User.findOne({ 'local.username': req.params.username }, (err, user) => {
      if (err) throw err;
      console.log(user.local.username);
      let post = {
        name: req.body.name,
        phone: req.body.phone,
        email: req.body.email,
        reason: req.body.reason,
        ins: req.body.ins,
        time: req.body.time
      };
      user.customers.push(post);
      user.save(function(err, update){
        if (err) return handleError(err);
        res.redirect('/' + req.params.username);
      });
    });
  });

  

}
