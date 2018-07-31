'use strict';

const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId, 
		ref: 'User',
	},
	business: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Business',
	},
	date: Date,
	reason: String,
});

module.exports = mongoose.model('Appointment', appointmentSchema);