'use strict';

const User = require('../models/user');
const Business = require('../models/business');
const Appointment = require('../models/appointment');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

//logging user list
// Appointment.find({}, (err, user) => {
//   if (err) throw err;
//   console.log(user);
// });
// User.find({}, (err, user) => {
//   if (err) throw err;
//   console.log(JSON.stringify(user));
// });
//User.deleteMany({}, function (err) {});
//Appointment.deleteMany({}, function (err) {});

module.exports = function(app, passport) {
	
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
      Appointment.find({ user: req.user.id }).populate({ path: 'user', select: 'firstname lastname' }).exec((err, appointments) => {
        if (err) throw err;
        res.render('business-home', {
          appointments: appointments,
        });
      });
    } else {
      Appointment.find({ user: req.user.id }).populate({ path: 'business', select: 'firstname lastname' }).exec((err, appointments) => {
        if (err) throw err;
        res.render('client-home', {
          contacts: req.user.contacts,
          appointments: appointments,
        });
      });
    }
  });

  /* GET business schedule page */
  app.get('/schedule', isLoggedIn, isBusiness, (req, res) => {
    res.render('business-schedule', {
      workdays: req.user.workdays,
      workhours: req.user.workhours,
      holidays: req.user.holidays,
    });
  });

  /* GET(ajax) business schedule workdays */
  app.post('/schedule/update', isLoggedIn, isBusiness, (req, res) => {
    if (req.user.kind === 'Business') {
      Business.findById(req.user.id, (err, business) => {
        let updatedDays = JSON.parse(req.body.days);
        let updatedTime = JSON.parse(req.body.time);
        let updatedHolidays = JSON.parse(req.body.holidays);
        if (updatedDays.length > 0) {
          business.workdays.forEach((day) => {
            updatedDays.forEach((updatedDay) => {
              if (day.dayNum === updatedDay.dayNum) {
                day.isAvailable = updatedDay.isAvailable;
              }
            });
          });
        }
        if (updatedTime.length > 0) {
          business.workhours.forEach((hour) => {
            updatedTime.forEach((updatedTime) => {
              if (hour.time === updatedTime.time) {
                hour.isAvailable = updatedTime.isAvailable;
              }
            });
          });
        }
        if (updatedHolidays.length > 0) {
          business.holidays.forEach((holiday) => {
            updatedHolidays.forEach((updatedHoliday) => {
              if (holiday.date === updatedHoliday.date) {
                holiday.isAvailable = updatedHoliday.isAvailable;
              }
            });
          });
        }
        business.markModified('workdays');
        business.save((err, update) => {
          if (err) return handleError(err);
          res.send('Your schedule has been updated');
        });
      });
      //res.send(req.body);
    }
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
  app.get('/search', isLoggedIn, isClient, (req, res) => {
    res.render('client-search', {
      contacts: req.user.contacts,
      //results: [],
    });
  });

  /* GET(ajax) client find request*/
  app.get('/search/:pattern', isLoggedIn, isClient, (req, res) => {
    let pattern = new RegExp(req.params.pattern, "gi");
    Business.find({ 'local.username': pattern }, '_id local.username', (err, usernames) => {
      if (err) throw err;
      res.json({
        results: usernames,
        contacts: req.user.contacts,
      });
    });
    //res.send(req.body);
  });

  /* POST(ajax) client add contact page*/
  app.post('/search/add', isLoggedIn, isClient, (req, res) => {
    User.findById(req.user.id, (err, user) => {
      if (!user.contacts.includes(req.body.id)) {
        user.contacts.push(req.body.id);
      }
      user.save((err, update) => {
        if (err) return handleError(err);
        res.send(update.contacts);
      });
    });
  });

  /* POST(ajax) client remove contact request*/
  app.post('/search/remove', isLoggedIn, isClient, (req, res) => {
    User.findById(req.user.id, (err, user) => {
      if (err) throw err;
      let i = user.contacts.indexOf(req.body.id);
      user.contacts.splice(i, 1);
      user.save((err, update) => {
        if (err) return handleError(err);
        res.send(update.contacts);
      });
    });
    //res.send(req.body);
  });

  /* GET client book page */
  app.get('/book/:id', isLoggedIn, isClient, (req, res) => {
    Business.findById(req.params.id).populate('appointments').exec((err, business) => { 
      if (err) throw err;
      User.findById(req.user.id, 'contacts').populate('contacts').exec((err, contacts) => {
        if (err) throw err;
        let date = new Date()
        date.setSeconds(0);
        date.setMilliseconds(0);
        res.render('client-booking', {
          user: req.user,
          contacts: contacts.contacts,
          business: business,
          days: business.createMonth(),
          dateObj: date,
        });
      });
    });
  });

  /* POST(ajax) client book nextmonth request */
  app.post('/book/:id/month', isLoggedIn, isClient, (req, res) => {
    Business.findById(req.params.id, (err, business) => {
      let date = new Date(req.body.dateISO);
      let month = date.getMonth();
      let year = date.getFullYear();
      if (req.body.month == 'next') {
        if (month + 1 > 11) {
          month = 0;
          year++;
          } else {
            month++;
          }
      }
      if (req.body.month == 'prev') {
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
      date.setFullYear(year);
      date.setMonth(month);
      res.json({ 
        days: business.createMonth(date),
        dateISO: date.toISOString(),
      });
    });
  });

  /* POST(ajax) client book another day request */
  app.post('/book/:id/day', isLoggedIn, isClient, (req, res) => {
    Business.findById(req.params.id).populate('appointments').exec((err, business) => {
      if (err) throw err;
      let date = new Date(req.body.dateISO);
      date.setDate(parseInt(req.body.day));
      res.json({ 
        hours: business.createDay(date),
        dateISO: date.toISOString(),
      });
    });
  });

  /* POST(ajax) client book request */
  app.post('/book/:id/book', isLoggedIn, isClient, (req, res) => {
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
              res.send(`Your appointment is scheduled on ${new Date(appointment.date).toLocaleDateString()}
               at ${new Date(appointment.date).toLocaleTimeString().substring(0,8)}`);
            });
          });
        });
      });
    });
    //res.send(req.body);    
  });

  /* GET client contacts page */
  app.get('/contacts', isLoggedIn, isClient, (req, res) => {
    User.findById(req.user._id, 'contacts').populate('contacts').exec((err, contacts) => {
      res.render('client-contacts', {
        contacts: req.user.contacts,
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
  function isBusiness(req, res, next) {
    if (req.user.kind === 'Business') {
      return next();
    }
    res.redirect('/');
  }
  function isClient(req, res, next) {
    if (req.user.kind !== 'Business') {
      return next();
    }
    res.redirect('/');
  }

}