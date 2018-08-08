const fs = require('fs');
const Appointment = require('../models/appointment');

module.exports = {
	removeOldAppointments: function(h, m, s, ms) {
		const time = new Date();
		time.setHours(h);
		time.setMinutes(m);
		time.setSeconds(s);
		time.setMilliseconds(ms);
		const launchTime = time.getTime() - new Date().getTime() > 0 ? time.getTime() - new Date().getTime() : new Date().getTime() - time.getTime();  
		setTimeout( function() { 
			setInterval(deleteOldAppointments, 24 * 60 * 60 * 1000);
		}, launchTime);

	}
}

function deleteOldAppointments() {
  Appointment.deleteMany({ timeMMM: { $lt: new Date().getTime() } }, (err) => {});
  fs.appendFile('log.txt', `Old appointments were deleted on ${new Date().toISOString()} \n`, (err) => {
	  if (err) throw err;
	  console.log('Old appointments were deleted on ${new Date()}');
	});
}



