const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const customerSchema = new Schema({
		name: String,
		phone: String,
		email: String,
		reason: String,
		ins: String,
		time: String
	});
const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;