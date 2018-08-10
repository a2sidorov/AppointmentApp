'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');

const options = {discriminatorKey: 'kind'};

const userSchema = new mongoose.Schema({
	local: {
		username: { type: String, reqired: true, unique: true },
		email: { type: String, required: true, unique: true },
		password: { type: String, required: true },
    resetPasswordToken: String,
    resetPasswordExpires: Date
	},
  firstname: String,
  lastname: String,
  contacts: [{type: mongoose.Schema.Types.ObjectId, ref: 'Business'}],
  appointments: [{type: mongoose.Schema.Types.ObjectId, ref: 'Appointment'}],
}, options);


//generating a hash
userSchema.methods.generateHash = function (password){
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

//checking if password is valid
userSchema.methods.validPassword = function (password){
	return bcrypt.compareSync(password, this.local.password);
};

module.exports = options;
module.exports = mongoose.model('User', userSchema);
