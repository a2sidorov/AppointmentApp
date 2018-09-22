'use strict';

//const User = require('../models/user');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  }
});

module.exports = {
  sendToken: async (req, email, token) => {
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: 'Appointment App Password Reset',
      text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
      'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
      'http://' + req.headers.host + '/reset/' + token + '\n\n' +
      'If you did not request this, please ignore this email and your password will remain unchanged.\n'
    };
    await transporter.sendMail(mailOptions);
  },
  sendConfirmation: async (email) => {
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: 'Your password has been changed',
      text: 'Hello,\n\n' +
      'This is a confirmation that the password for your account ' + email + ' has just been changed.\n'
    };
    await transporter.sendMail(mailOptions);
  }
}
      /*
module.exports = async (req) => {
  const user = await User.findOne({ 'local.email': req.body.email });
  if (!user) {
    return { success: false, massage: 'No account with that email address exists.' };
  } else {
    const buf = await crypto.randomBytes(20);
    const token =  buf.toString('hex')
//   process.env.TEST_TOKEN = token; //for testing
    user.local.resetPasswordToken = token;
    user.local.resetPasswordExpires = Date.now() + 3600000;
    await user.save();
    //    const transporter = nodemailer.createTransport({
    //      service: 'gmail',
    //      auth: {
    //	user: process.env.EMAIL,
    //	pass: process.env.EMAIL_PASS,
    //      }
    //    });
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
	user: process.env.EMAIL,
	pass: process.env.EMAIL_PASS,
      }
    });
    const mailOptions = {
      from: process.env.EMAIL,
      to: user.local.email,
      subject: 'Appointment App Password Reset',
      text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
      'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
      'http://' + req.headers.host + '/reset/' + token + '\n\n' +
      'If you did not request this, please ignore this email and your password will remain unchanged.\n'
    };
    await transporter.sendMail(mailOptions);
    return { success: true, message: 'Recovery email has been sent' };
  }
}
*/
