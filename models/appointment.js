'use strict';

const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
  },
  userEmail: { type: String, required: true },
  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
  },
  businessEmail: { type: String, required: true },
  date: { type: String, required: true },
  reason: String,
  canceled: Boolean,
  timestamp: { type: Number, required: true },
});

module.exports = mongoose.model('Appointment', appointmentSchema);
