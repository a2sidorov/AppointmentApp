'use strict';

const mongoose = require('mongoose');
//const bcrypt = require('bcrypt-nodejs');
const options = {discriminatorKey: 'kind'};
//const validator = require('validator');

const userSchema = new mongoose.Schema({
  local: {
    email: { type: String, required: true, unique: true, validate: {
      validator: function(value) {
        return validator.isEmail(value);
      },
    }},
    password: { type: String, required: true }, 
    resetPasswordToken: String,
    resetPasswordExpires: Date
  },
  firstname: { type: String, maxlength: 20, validate: {
    validator: function(value) {
      return (/^[a-zA-Z0-9@#$]*$/).test(value);
    },
  }},
  lastname: { type: String, maxlength: 20, validate: {
    validator: function(value) {
      return (/^[a-zA-Z0-9@#$]*$/).test(value);
    },
  }},
  contacts: [{type: mongoose.Schema.Types.ObjectId, ref: 'Business'}],
  appointments: [{type: mongoose.Schema.Types.ObjectId, ref: 'Appointment'}],
}, options);


//generating a hash
userSchema.methods.generateHash = function (password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

//checking if password is valid
userSchema.methods.validPassword = function (password) {
  return bcrypt.compareSync(password, this.local.password);
};

module.exports = options;
module.exports = mongoose.model('User', userSchema);
