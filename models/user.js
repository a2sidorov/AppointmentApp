'use strict';

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstname: { type: String },
});

module.exports = mongoose.model('User1', userSchema);