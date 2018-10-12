'use strict';

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  //service: 'gmail',
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
      