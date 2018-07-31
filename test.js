const assert = require('assert');
const mongoose = require('mongoose');
const Business = require('./models/business');

mongoose.connect('mongodb+srv://test1:noldor1986@cluster0-fwxgm.mongodb.net/test?retryWrites=true/mydb');

let dateObj = new Date(2018, 7, 1, 10, 0);

let appointments = [ { _id: '5b6011c51b47c61bca9ac04e',
    user: '5b5fe26009665b12e7618a7e',
    business: '5b5fe21a09665b12e7618a7c',
    date: '2018-08-01T08:00:00.000Z',
    reason: '',
    __v: 0 } ];

describe('Business', () => {
	describe('Creating month', () => {
		it('should return array', () => {
			Business.findOne({ 'local.username': 'business1' }, (err, business) => {
				if (err) done(err);
		  	assert.equal(true, Array.isArray(business.createDay(dateObj, appointments)));
		  	console.log(business.createDay(dateObj, appointments));

		  });
		});
	});
});












