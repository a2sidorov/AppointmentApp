'use strict';

const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
  },
  userEmail: String,
  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
  },
  businessEmail: String,
  date: String,
  reason: String,
  canceled: Boolean,
  //timeMs: Number,
});

module.exports = mongoose.model('Appointment', appointmentSchema);
