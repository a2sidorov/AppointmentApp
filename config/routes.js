'use strict';

const User = require('../models/user');
const Business = require('../models/business');
const Appointment = require('../models/appointment');
const holidays = require('./googleapi');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const share = require('../public/share');

let DateObj;
// let Month = new Date().getMonth();
// let Year = new Date().getFullYear();
//logging user list
Appointment.find({}, (err, user) => {
  if (err) throw err;
  console.log(user);
});
//Appointment.deleteMany({}, function (err) {});

module.exports = function(app, passport) {
	
  //init data object
  // let curDate = new Date(),
  // year = curDate.getFullYear(),
  // month = curDate.getMonth(),
  // today = curDate.getDate(),
  // weekDay = (curDate.getDay() === 0) ? 7 : curDate.getDay(),
  // curMonth = month,
  // curYear = year,
  // curMonday = today - weekDay + 1;
  // let timeArr = [];
  // const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  /* GET login page. */
  app.get('/', (req, res) => {
  	res.render('login', {
  		message: req.flash('loginMessage')
  	});
  });

  /* POST login */
  app.post('/login', function(req, res, next) {
    passport.authenticate('local-login', function(err, user, info) {
      if (err) return next(err);
      if (!user) return res.redirect('/');
      req.logIn(user, function(err) {
        if (err) return next(err);
        // if (req.body.rememberme === 'on') {
        //   req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
        // } 
        // if (req.body.rememberme !== 'on') {
        //   req.session.cookie.maxAge = null;
        // }
        return res.redirect('/home');
      });
   })(req, res, next);
  });

  /* GET password recovery page */
  app.get('/forgot', (req, res) => {
    res.render('forgot', {
      message: req.flash('info')
    });
  });

  /* POST password recovery */
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

  /* GET password reset page */
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
        });
      }
    });
  });

  /* GET registration Page */
  app.get('/signup',(req, res) => {
  	res.render('signup', {
  		message: req.flash('signupMessage')
  	});
  });

  /* POST sign up */
  app.post('/signup', function(req, res, next) {
    passport.authenticate('local-signup', function(err, user, info) {
      if (err) return next(err);
      if (!user) return res.redirect('/signup');
      req.logIn(user, function(err) {
        if (err) return next(err);
        return res.redirect('/home');
      });
   })(req, res, next);
  });

  /* GET business/client home page */
  app.get('/home', isLoggedIn, (req, res) => {
    if (req.user.kind === 'Business') {
      res.render('business-home', {
        business: req.user,
      });
    } else {
      res.render('client-home', {
        user: req.user,
      });
    }
  });

  /* GET business schedule */
  app.get('/schedule', isLoggedIn, (req, res) => {
    holidays((data) => {
      if (req.user.kind === 'Business') {
        res.render('business-schedule', {
          business: req.user,
          allHolidays: data,
        });
      }
    });
  });

  /* POST business schedule */
  app.post('/schedule', isLoggedIn, (req, res) => {
    User.findById(req.user.id, (err, user) => { 
      if (user.kind === 'Business') {
        user.workdays = req.body.workdays;
        user.workhours = req.body.workhours;
        user.holidays = req.body.holidays; 
        user.exceptionDates = req.body.exceptionDates;
        user.save((err, update) => {
          if (err) return handleError(err);
          res.redirect('/schedule');
        });
      }
    });
    //res.send(req.body);
  });

   /* GET business/client profile page */
  app.get('/profile', isLoggedIn, (req, res) => {
    if (req.user.kind === 'Business') {
      res.render('business-profile', {
        business: req.user,
      });
    } else {
      res.render('client-profile', {
        user: req.user,
      });
    }
  });

  /* POST business/client profile*/
  app.post('/profile', isLoggedIn, (req, res) => {
    User.findById(req.user.id, (err, user) => {
      if (err) throw err;
      user.firstname = req.body.firstname;
      user.lastname = req.body.lastname;
      user.save((err, update) => {
        if (err) return handleError(err);
        res.redirect('/profile');
      });
    });
    //res.send(req.body);
  });

   /* GET client contact search page*/
  app.get('/search', isLoggedIn, (req, res) => {
    res.render('client-search', {
      user: req.user,
      results: [],
    });
  });


  /* POST client find request*/
  app.post('/search', isLoggedIn, (req, res) => {
    let pattern = new RegExp(req.body.username, "gi");
    Business.find({ 'local.username': pattern }, (err, users) => {
      if (err) throw err;
      res.json({
        results: users, 
      });
    });
    //res.send(req.body);
  });

  /* GET client add contact page*/
  app.get('/search/:id', isLoggedIn, (req, res) => {
    Business.findById(req.params.id, (err, business) => {
      let added = req.user.contacts.includes(req.params.id);
      res.render('client-addcontact', {
        user: req.user,
        business: business,
        added: added,
      });
    });
  });

  /* POST client add contact request*/
  app.get('/search/:id/add', isLoggedIn, (req, res) => {
    User.findById(req.user.id, (err, user) => {
      if (err) throw err;
      user.contacts.push(req.params.id);
      user.save((err, update) => {
        if (err) return handleError(err);
        res.redirect(`/search/${req.params.id}`);
      });
    });
    //res.send(req.body);
  });

  /* POST client remove contact request*/
  app.get('/search/:id/remove', isLoggedIn, (req, res) => {
    User.findById(req.user.id, (err, user) => {
      if (err) throw err;
      let i = user.contacts.indexOf(req.body.contact);
      user.contacts.splice(i, 1);
      user.save((err, update) => {
        if (err) return handleError(err);
        res.redirect(`/search/${req.params.id}`);
      });
    });
    //res.send(req.body);
  });

  /* GET client book page */
  app.get('/book/:id', isLoggedIn, (req, res) => {
    Business.findById(req.params.id).populate('appointments').exec((err, business) => { 
      if (err) throw err;
      User.findById(req.user.id, 'contacts').populate('contacts').exec((err, contacts) => {
        if (err) throw err;
        DateObj = new Date();
        DateObj.setSeconds(0);
        DateObj.setMilliseconds(0);
        res.render('client-booking', {
          user: req.user,
          contacts: contacts.contacts,
          business: business,
          days: business.createMonth(DateObj),
          hours: business.createDay(DateObj),
          DateObj: DateObj,
        });
      });
    });
  });


  /* GET client book nextmonth request */
  app.get('/book/:id/month/:month', isLoggedIn, (req, res) => {
    Business.findById(req.params.id, (err, business) => {
      let month = DateObj.getMonth();
      let year = DateObj.getFullYear();
      if (req.params.month == 'nextmonth') {
        if (month + 1 > 11) {
          month = 0;
          year++;
          } else {
            month++;
          }
      }
      if (req.params.month == 'prevmonth') {
        if (year > new Date().getFullYear()) {
          if (month - 1 < 0) {
            month = 11;
            year--;
          } else {
            month--;
          }
        } else if (year === new Date().getFullYear() && month - 1 >= new Date().getMonth()) {
          month--;
        }
      }
      DateObj.setFullYear(year);
      DateObj.setMonth(month);
      //res.redirect(`/book/${req.params.id}`);
      res.json({ 
        days: business.createMonth(DateObj),
        DateObj: DateObj,
      });
    });
  });

  
  /* GET client book another day request */
  app.get('/book/:id/day/:day', isLoggedIn, (req, res) => {
    Business.findById(req.params.id).populate('appointments').exec((err, business) => {
      if (err) throw err;
      console.log(typeof req.params.day);
      DateObj.setDate(parseInt(req.params.day));
      res.json({ 
        hours: business.createDay(DateObj),
        DateObj: DateObj,
      });
    });
  });

   /* POST client book request */
  app.post('/book/:id/book', isLoggedIn, (req, res) => {
    User.findById(req.user.id, (err, user) => {
      if (err) throw err;
      Business.findById(req.params.id, (err, business) => {
        if (err) throw err;
        let newAppnt = new Appointment();
        newAppnt.user = user._id;
        newAppnt.business = business._id;
        newAppnt.date = req.body.date;
        newAppnt.reason = req.body.reason;
        newAppnt.save((err, appointment) => {
          if (err) throw err;
          user.appointments.push(appointment._id);
          user.save((err, result) => {
            if (err) throw err;
            business.appointments.push(appointment._id);
            business.save((err, result) => {
              if (err) throw err;
              res.send('Appoinment is made');
            });
          });
        });
      });
    });
    //res.send(req.body);    
  });

  /* GET client contacts page */
  app.get('/contacts', isLoggedIn, (req, res) => {
    User.findById(req.user._id, 'contacts').populate('contacts').exec((err, contacts) => { 
      console.log(contacts);
      res.render('client-contacts', {
        user: req.user,
        contacts: contacts.contacts,
      });
    });
  })

  /* GET Log Out */
  app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });
  
  function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/');
  }

}