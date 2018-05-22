const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const customerSchema = new Schema({
		name: {
			type: String,
			required: [true, 'Why no name?']
		},
		phone: {
			type: String
		},
		email: {type: String},
		reason: {type: String},
		ins: {type: String},
		time: {type: String}
	});
const Customer = mongoose.model('Customer', customerSchema);


module.exports = Customer;