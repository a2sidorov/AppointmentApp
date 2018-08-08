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
	date: String,
	reason: String,
	canceled: Boolean,
	timeMMM: Number,
});

module.exports = mongoose.model('Appointment', appointmentSchema);