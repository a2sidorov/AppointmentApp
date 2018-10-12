'use strict';

const User = require('../models/user');
const Business = require('../models/business');
const Appointment = require('../models/appointment');
const crypto = require('crypto');
const validator = require('validator');
const passwordReset = require('./passwordReset');

module.exports = (app, passport) => {

  /* GET login page. */
  app.get('/', (req, res) => {
    res.render('login');
  });
  /* GET login page. */
  app.get('/time', (req, res) => {
    res.json({
      hours: new Date().getHours(),
      iso: new Date().toISOString(),
      offset: new Date().getTimezoneOffset(),
    });
  });

  /* POST(ajax) login */
  app.post('/login', isEmailValid, isPasswordValid, (req, res, next) => {
    passport.authenticate('local-login', (err, user, info) => {
      if (err) return next(err); 
      if (!user) return res.json({ success: false, message: info });
      req.logIn(user, (err) => {
  if (err) return next(err);
  return res.json({ success: true });
      });
    })(req, res, next);
  });

  /* GET sign up page */
  app.get('/signup', (req, res) => {
    res.render('signup');
  });

  /* POST sign up */
  app.post('/signup', isEmailValid, isPasswordValid, isConfirmPasswordValid, (req, res, next) => {
    passport.authenticate('local-signup', (err, user, info) => {
      if (err) return next(err);
      if (!user) return res.json({ success: false, message: info });
      req.logIn(user, (err) => {
        if (err) return next(err);
        return res.json({ success: true });
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
  app.post('/forgot', isEmailValid, async (req, res, next) => {
    try {
      const user = await User.findOne({ 'local.email': req.body.email });
      if (!user) {
        return res.json({
          success: false, message: 'No account with that email address found.'
        });
      }
      const buf = await crypto.randomBytes(20);
      const token =  buf.toString('hex')
      user.local.resetPasswordToken = token;
      user.local.resetPasswordExpires = Date.now() + (60 * 60 * 1000);
      await user.save();
      passwordReset.sendToken(req, user.local.email, token);
      return res.json({
        success: true, message: 'Recovery email has been sent.'
      });
    } catch(err) {
      next(err);
    }
  });

  /* GET password reset page */
  app.get('/reset/:token', async (req, res, next) => {
    try {
      const user = await User.findOne({ 'local.resetPasswordToken': req.params.token });
      if (!user) {
        req.flash('info', 'Password reset token is invalid.');
        return res.redirect('/forgot');
      }
      if (user.local.resetPasswordExpires < Date.now()) {
        req.flash('info', 'Password reset token is expired.');
        return res.redirect('/forgot');
      }
      return res.render('reset');
    } catch(err) {
      next(err);
    }
  });

  /* POST Password reset */
  app.post('/reset/:token', isPasswordValid, isConfirmPasswordValid, async (req, res, next) => {
    try {
      const user = await User.findOne({ 'local.resetPasswordToken': req.params.token });
      if (!user) {
        return res.json({
          success: false, massage: 'Password reset token is invalid.'
        });
      }
      if (user.local.resetPasswordExpires < Date.now()) {
        return res.json({
          success: false, massage: 'Password reset token is expired.'
        });
      }
      user.local.password = user.generateHash(req.body.password);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      passwordReset.sendConfirmation(user.local.email);
      res.json({
        success: true,
        message: 'Success! Your password has been changed.'
      });
    } catch(err) {
      next(err);
    }
  });

  /* GET home page */
  app.get('/home', isLoggedIn, async (req, res, next) => {
    try {
      if (req.user.kind === 'Business') {
        const appointments = await Appointment
          .find({ business: req.user.id })
          .populate({ path: 'user', select: 'local.email' })
          .exec();
        res.setHeader('view', 'business-home');
        return res.render('business-home', {
          appointments: appointments,
          message: "",
        });
      }
      /*
      const user = User.findById(req.user.id)
        .populate({ path: 'contacts', select: 'local.email' })
        .exec();
      */
      const appointments = await Appointment.find({ user: req.user.id })
        .populate({ path: 'business', select: 'local.email' })
        .exec();
      res.setHeader('view', 'client-home');
      return res.render('client-home', {
        contacts: req.user.contacts,
        appointments: appointments,
        message: "",
        //contacts: user.contacts,
      });
    } catch(err) {
      next(err);
    }
  });

  /* GET business schedule page */
  app.get('/schedule', isLoggedIn, isBusiness, (req, res) => {
    res.render('business-schedule', {
      workdays: req.user.workdays,
      workhours: req.user.workhours,
      holidays: req.user.holidays,
      active: req.user.active,
    });
  });

  /* POST(ajax) business schedule workdays */
  app.post('/schedule/update', isLoggedIn, isBusiness, async (req, res, next) => {
    try {
      const business = await Business.findById(req.user.id, 'workdays workhours holidays');
      if (req.body.days.length === 0 && req.body.time.length === 0 && req.body.holidays.length === 0) {
        return res.json({
          success: false,
          message: 'No changes are sent'
        });
      }
      if (req.body.days.length > 0) {
        business.workdays.forEach((day) => {
          req.body.days.forEach((updatedDay) => {
            if (day.dayNum === updatedDay.dayNum) {
              day.isAvailable = updatedDay.isAvailable;
            }
          });
        });
        business.markModified('workdays');
      }
      if (req.body.time.length > 0) {
        business.workhours.forEach((hour) => {
          req.body.time.forEach((updatedTime) => {
            if (hour.time === updatedTime.time) {
              hour.isAvailable = updatedTime.isAvailable;
            }
          });
        });
        business.markModified('workhours');
      }
      if (req.body.holidays.length > 0) {
        business.holidays.forEach((holiday) => {
          req.body.holidays.forEach((updatedHoliday) => {
            if (holiday.date === updatedHoliday.date) {
              holiday.isAvailable = updatedHoliday.isAvailable;
            }
          });
        });
        business.markModified('holidays');
      }
      await business.save();
      res.json({
  success: true,
  message: 'Your schedule has been updated'
      });
    } catch(err) {
      next(err);
    }
  });

  /* POST activate and deactivate schedule */
  app.post('/schedule/active', isLoggedIn, isBusiness, async (req, res, next) => {
    try {
      if (typeof req.body.active !== 'boolean') {
        return res.json({
          success: false,
          message: 'Invalid data'
        });
      }
      const business = await Business.findById(req.user.id, 'active');
      business.active = req.body.active;
      await business.save();
      
      const msg = business.active ? 'Your schedule has been activated' : 'Your schedule has been suspended';
      res.json({
        success: true,
        active: business.active,
        message: msg
      });

    } catch(err) {
      next(err);
    }
  });

  /* GET business/client profile page */
  app.get('/profile', isLoggedIn, (req, res) => {
    if (req.user.kind === 'Business') {
      res.setHeader('view', 'business-profile');
      return res.render('business-profile', {
        firstname: req.user.firstname,
        lastname: req.user.lastname,
      });
    }
    res.setHeader('view', 'client-profile');
    res.render('client-profile', {
      firstname: req.user.firstname,
      lastname: req.user.lastname,
      contacts: req.user.contacts,
    });
  });

  /* POST(ajax) business/client profile*/
  app.post('/profile/update', isLoggedIn, async (req, res, next) => {
    try {
      if (!req.body.firstname && !req.body.lastname) {
        return res.json({
          success: false,
          message: 'No data is sent'
        });
      }
      const user = await User.findById(req.user.id, 'firstname lastname');
      user.firstname = req.body.firstname;
      user.lastname = req.body.lastname;
      await user.save();
      res.json({
        success: true,
        message: 'Your profile has been updated'
      });
    } catch(err) {
      next(err);
    }
  });

  /* POST delete account*/
  app.post('/profile/delete', isLoggedIn, isPasswordValid, async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user.validPassword(req.body.password)) {
        return res.json({
          success: false,
          message: 'Wrong password.'
        })
      }
      if (req.user.kind  === 'Business') {
        const appointments = await Appointment.find({ 'business': req.user.id });
        appointments.forEach(async appointment => {
          appointment.canceled = true;
          await appointment.save();
        });
      }
      await User.findByIdAndRemove(req.user._id);
      req.logout();
      res.json({
        success: true,
        message: 'Your account has benn successfully deleted.'
      });
    } catch(err) {
      next(err);
    }
  });

  /* GET client contact search page*/
  app.get('/search', isLoggedIn, isClient, (req, res) => {
    res.render('client-search', {
      contacts: req.user.contacts,
    });
  });

  /* POST(ajax) client find request*/
  app.post('/search', isLoggedIn, isClient, async (req, res, next) => {
    try {
      const pattern = new RegExp(req.body.pattern, "gi");
      const businesses = await Business.find({ 'local.email': pattern }, '_id local.email');
      if (businesses.length === 0) {
        return res.json({
          success: false,
          message: 'No match found.'
        });
      }
      res.json({
        success: true,
        results: businesses,
        contacts: req.user.contacts,
      });
    } catch(err) {
      next(err);
    }
  });

  /* POST(ajax) client add business to contact list*/
  app.post('/search/add', isLoggedIn, isClient, isContactIdValid,  async (req, res, next) => {
    try {
      const contacts = req.user.contacts.map(id => id.toString()); //converting array of objects to array of strings
      if (contacts.includes(req.body.id)) {
        return res.json({
          success: false,
          message: 'This business is already in your contact list'
        });
      }
      const user = await User.findById(req.user.id, 'contacts');
      user.contacts.push(req.body.id);
      await user.save();
      res.json({
        success: true,
        message: 'Contact has been added'
      });
    } catch(err) {
      next(err);
    }
  });

  /* POST(ajax) client remove business from contact list*/
  app.post('/search/remove', isLoggedIn, isClient, isContactIdValid, async (req, res, next) => {
    try {
      const contacts = req.user.contacts.map(id => id.toString()); //converting array of objects to array of strings
      const i = contacts.indexOf(req.body.id);
      if (i === -1) {
        return res.json({
          success: false,
          message: 'This id is not in your contact list'
        });
      }
      const user = await User.findById(req.user.id, 'contacts');
      user.contacts.splice(i, 1);
      await user.save();
      res.json({
        success: true,
        message: 'Contact has been removed'
      });
    } catch(err) {
      next(err);
    }
  });

  /* GET client contacts page */
  app.get('/contacts', isLoggedIn, isClient, async (req, res, next) => {
    try {
      const user = await User.findById(req.user._id, 'contacts').populate({ path: 'contacts', select: 'local.email' }).exec();
      res.render('client-contacts', {
        contacts: user.contacts,
      });
    } catch(err) {
      next(err);
    }
  });

  /* GET client book page (no contacts) */
  app.get('/book/nocontacts', isLoggedIn, isClient, (req, res) => {
    res.render('client-booking-nocontacts', {
      contacts: req.user.contacts,
      message: 'You don\'t have contacts to make an appointment.',
    });
  });
  
  /* GET client book page */
  app.get('/book/:id', isLoggedIn, isClient, isBusinessIdValid, async (req, res, next) => {
    try {
      const results = await Promise.all([
        User.findById(req.user.id).populate({ path: 'contacts', select: 'local.email' }).exec(),
        Business.findById(req.params.id).populate('appointments').exec(),
      ]);

      let localeDate = new Date(new Date().getTime() + req.user.local.timezoneOffset * 60 * 60 * 1000);
      if (process.env.NODE_ENV !== 'production') {
        localeDate = new Date();
      }
      localeDate.setSeconds(0);
      localeDate.setMilliseconds(0);

      res.render('client-booking', {
        contacts: results[0].contacts,
        chosenContact: results[1].local.email,
        active: results[1].active,
        workhours: results[1].workhours,
        days: results[1].createMonth(),
        //dateObj: militaryDate,
        dateObj: localeDate,
      });
    } catch(err) {
      next(err);
    }
  });

  /* POST(ajax) client book nextmonth request */
  app.post('/book/:id/month', isLoggedIn, isClient, isBusinessIdValid, async (req, res, next) => {
    try {
      const business = await Business.findById(req.params.id);
      const date = new Date(req.body.dateISO);
      let month = date.getMonth();
      let year = date.getFullYear();
      if (req.body.month === 'next') {
        if (month + 1 > 11) {
          month = 0;
          year++;
        } else {
          month++;
        }
      }
      if (req.body.month === 'prev') {
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
        success: true,
        days: business.createMonth(date),
        dateISO: date.toISOString(),
      });
    } catch(err) {
      next(err);
    }
  });

  /* POST(ajax) client book another day request */
  app.post('/book/:id/day', isLoggedIn, isClient, isBusinessIdValid, async (req, res, next) => {
    try {
      const business = await Business.findById(req.params.id).populate('appointments').exec();
      const date = new Date(req.body.dateISO);
      date.setDate(parseInt(req.body.day));
      res.json({ 
        success: true,
        hours: business.createDay(date),
        dateISO: date.toISOString(),
      });
    } catch(err) {
      next(err);
    }
  });

  /* POST(ajax) client book request */
  app.post('/book/:id/book', isLoggedIn, isClient, isBusinessIdValid, async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id, 'appointments');
      const business = await Business.findById(req.params.id).populate('appointments').exec();

      if (!business.active) {
        return res.json({
          success: false,
          message: 'This business is not currently available for booking.'
        });
      }

      if (!isReasonValid(req.body.reason)) {
        return res.json({
          success: false,
          message: 'Reason text must not contain words longer than 30 characters.'
        });
      }
      
      const date = new Date(req.body.dateISO);
      if ( !business.isWorkday(date) 
        || business.isHoliday(date)
        || business.isBooked(date)
        || business.isLate(date)) {
          return res.json({
            success: false,
            message: 'Requested time is not available for appointment.'
          });
        }
      const newAppnt = new Appointment();
      newAppnt.user = req.user.id;
      newAppnt.business = business._id;
      newAppnt.date = req.body.dateISO;
      newAppnt.reason = req.body.reason;
      newAppnt.canceled = false;
      newAppnt.timeMs = date.getTime();
      const appointment = await newAppnt.save();

      user.appointments.push(appointment._id);
      await user.save();

      business.appointments.push(appointment._id);
      await business.save();

      res.json({
        success: true,
        message: `Your appointment is scheduled on ${date.toLocaleDateString()}
          at ${date.toLocaleTimeString().substring(0,8)}`
      });
    } catch(err) {
      next(err);
    }
  });

  /* POST cancel appointment */
  app.post('/home/cancel', isLoggedIn, async (req, res, next) => { 
    try {
      const patt = /^[0-9a-z]{24}$/;
      if (!patt.test(req.body.appointmentId)) {
        return res.json({
          success: false,
          message: 'Invalid appointment id'
        });
      }
      const appointment = await Appointment.findById(req.body.appointmentId, 'canceled');
      if (appointment.canceled) {
        return res.json({
          success: false,
          message: 'This appointment is already canceled'
        });
      }
      appointment.canceled = true;
      await appointment.save();
      res.json({
        success: true,
        message: 'This appointment has been calceled'
      });
    } catch(err) {
      next(err);
    }
  });

  /* GET Log Out */
  app.get('/logout', isLoggedIn, (req, res) => {
    req.logout();
    res.redirect('/');
  });

  /* Error page */
  app.get('/error/:status', (req, res) => {
    res.render('error', {
      code: req.params.code,
    });
  });

  /* Error 404 page */
  app.get('*', (req, res) => {
    res.statusCode = 404;
    res.render('error', {
      code: 404, 
    });
  });

  function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    if (req.headers['content-type'] === 'application/json') {
      return res.json({
        success: false,
        message: 'You are not logged in'
      });
    }
    res.redirect('/');
  }

  function isBusiness(req, res, next) {
    if (req.user.kind === 'Business') {
      return next();
    }
    if (req.headers['content-type'] === 'application/json') {
      return res.json({
        success: false,
        message: 'You are not business'
      });
    }
    res.redirect('/');
  }

  function isClient(req, res, next) {
    if (req.user.kind !== 'Business') {
      return next();
    }
    if (req.headers['content-type'] === 'application/json') {
      return res.json({
        success: false,
        message: 'You are not client'
      });
    }
    res.redirect('/');
  }

  function isBusinessIdValid(req, res, next) {
    const patt = /^[0-9a-z]{24}$/;
    if (patt.test(req.params.id)) {
      return next();
    }
    if (req.headers['content-type'] === 'application/json') {
      return res.json({
        success: false,
        message: 'Invalid business id'
      });
    }
    res.redirect('/error/404');
  }

  function isContactIdValid(req, res, next) {
    if (!req.body.id) {
      return res.json({
        success: false,
        message: 'No id is sent'
      });
    }
    if (typeof req.body.id !== 'string') {
      return res.json({
        success: false,
        message: 'Sent id not a string'
      });
    }
    const patt = /^[0-9a-z]{24}$/;
    if (!patt.test(req.body.id)) {
      return res.json({
        success: false,
        message: 'Validation problem'
      });
    }
    return next();
  }

  function isEmailValid(req, res, next) {
    if (typeof req.body.email === 'string' && validator.isEmail(req.body.email)) {
      return next();
    }
    res.json({ 
      success: false,
      message: 'The entered email is not valid'
    });
  }

  function isPasswordValid(req, res, next) {
    if (!req.body.password) {
      return res.json({ 
        success: false,
        message: 'No password is sent'
      });
    }
    if (!(/^[a-zA-Z0-9@#]+$/).test(req.body.password)) {
      return res.json({ 
        success: false,
        message: 'Password must contain only a-zA-Z0-9@# characters'
      });
    }
    if (req.body.password.length < 6) {
      return res.json({ 
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }
    if (req.body.password.length > 20) {
      return res.json({ 
        success: false,
        message: 'Password must be less than 20 characters long'
      });
    } 
    return next();
  }

  function isConfirmPasswordValid(req, res, next) {
    if (!req.body.confirm) {
      return res.json({ 
        success: false,
        message: 'No confirmation password is sent'
      });
    }
    if (!(/^[a-zA-Z0-9@#]+$/).test(req.body.confirm)) {
      return res.json({ 
        success: false,
        message: 'Confirmation password must contain only a-zA-Z0-9@# characters'
      });
    }
    
    if (req.body.password !== req.body.confirm) {
      return res.json({ 
        success: false,
        message: 'The entered passwords do not match.'
      });
    }
    if (req.body.password.length < 6) {
      return res.json({ 
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }
    if (req.body.password.length > 20) {
      return res.json({ 
        success: false,
        message: 'Password must be less than 20 characters long'
      });
    } 
    return next();
  }

  function isReasonValid(str) {
    let result = true;
    const array = str.split(" ");

    array.forEach((word) => {
      if (word.length > 30) {
        result = false;
      }
    });

    return result;
  }

}
