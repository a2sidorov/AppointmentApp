'use strict';

const User = require('../models/user');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

module.exports = async (req) => {
  const user = await User.findOne({ 'local.email': req.body.email });
  console.log(1);
  if (!user) {
    return { success: false, masseage: 'No account with that email address exists.' };
  } else {
    const buf = await crypto.randomBytes(20);
    console.log(2);
    const token =  buf.toString('hex')
    user.local.resetPasswordToken = token;
    user.local.resetPasswordExpires = Date.now() + 3600000;
    await user.save();
    console.log(3);
    const transporter = await nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
      }
    });
    console.log(3.1);
    const mailOptions = {
      from: process.env.EMAIL,
      to: user.local.email,
      subject: 'Appointment App Password Reset',
      text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
      'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
      'http://' + req.headers.host + '/reset/' + token + '\n\n' +
      'If you did not request this, please ignore this email and your password will remain unchanged.\n'
    };
    console.log(3.2);
    await transporter.sendMail(mailOptions);
    console.log(4);
    return { success: true, message: 'Recovery email has been sent' };
  }
}
      //        crypto.randomBytes(20, (err, buf) => {
      //          if (err) throw err;
      //          const token = buf.toString('hex')
      //          user.local.resetPasswordToken = token;
      //          user.local.resetPasswordExpires = Date.now() + 3600000;
      //
      //          user.save((err, update) => {
      //            if (err) throw err;
      //            const transporter = nodemailer.createTransport({
      //              service: 'gmail',
      //              auth: {
      //                user: process.env.EMAIL,
      //                pass: process.env.EMAIL_PASS,
      //              }
      //            });
      //            const mailOptions = {
      //              from: process.env.EMAIL,
      //              to: user.local.email,
      //              subject: 'Appointment App Password Reset',
      //              text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
      //              'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
      //              'http://' + req.headers.host + '/reset/' + token + '\n\n' +
      //              'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      //            };
      //
      //            transporter.sendMail(mailOptions, (error, info) => {
      //              if (err) console.log(err); 
      //              else {
      //                req.flash('info', 'Recovery email has been sent');
      //                res.render('forgot', {
      //                  message: req.flash('info')
      //    return true;
      //  }
      //}

      //test('test');
