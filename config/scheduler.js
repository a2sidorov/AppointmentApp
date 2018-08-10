const schedule = require('node-schedule');
const holidays = require('./holidays');

const removeOldAppointments = schedule.scheduleJob('* 0 * * *', function() {
  Appointment.deleteMany({ timeMMM: { $lt: new Date().getTime() } }, (err) => {});
  fs.appendFile('log.txt', `Old appointments were deleted on ${new Date().toISOString()} \n`, (err) => {
	  if (err) throw err;
	  console.log('Old appointments were deleted on ${new Date()}');
	});
});

const updateHolidaysFile = schedule.scheduleJob('* * 1 1 1 *', function() {
  holidays.updateFile();
});

const updateUsersHolidays = schedule.scheduleJob('* * 2 1 1 *', function() {
  holidays.updateUsersHolidays();
});


const m30 = schedule.scheduleJob('30 * * * *', function() {
  //holidays.updateUsersHolidays();
  console.log(`m30 ${new Date().toISOString()}`);
});

const s10 = schedule.scheduleJob('10 * * * * *', function() {
  //holidays.updateUsersHolidays();
  console.log(`s10 ${new Date().toISOString()}`);
});



























// const fs = require('fs');
// const Appointment = require('../models/appointment');
// const updateHolidays = require('./googleapi');
// const Business = require('../models/business');
// const path = require('path');
// const filePath = path.join(__dirname, 'holidays');

// module.exports = {
// 	removeOldAppsTime: function(h, m, s, ms) {
// 		const time = new Date();
// 		time.setHours(h);
// 		time.setMinutes(m);
// 		time.setSeconds(s);
// 		time.setMilliseconds(ms);
// 		const launchTime = time.getTime() - new Date().getTime() > 0 ? time.getTime() - new Date().getTime() : new Date().getTime() - time.getTime();  
// 		console.log('removeOldAppsTime in ' + launchTime/(60 * 60 * 1000)); 
// 		setTimeout( function() { 
// 			setInterval(removeOldApps, 24 * 60 * 60 * 1000);
// 		}, launchTime);
// 	},
// 	updateHolidayFile: function() {
// 		const date = new Date(new Date().getFullYear() + 1, 0, 1, 1, 0, 0, 0);
// 		const launchTime = date.getTime() - new Date().getTime();
// 		console.log('updateHolidayFile in ' + launchTime/(24 * 60 * 60 * 1000));
// 		// setTimeout( function() { 
// 		// 	setInterval(updateHolidays, 365 * 24 * 60 * 60 * 1000);
// 		// }, launchTime);
// 	},
// 	updateUsersHolidays: function() {
// 		const date = new Date(new Date().getFullYear() + 1, 0, 1, 2, 0, 0, 0);
// 		const launchTime = date.getTime() - new Date().getTime();
// 		console.log('updateHolidaysTime in ' + launchTime);
// 		// setTimeout( function() { 
// 		// 	setInterval(updateUsersHolidays, 365 * 24 * 60 * 60 * 1000);
// 		// }, launchTime);
// 		setTimeout(function() { 
// 			setInterval(function(){console.log('updateUsersHolidays')}, 5000); 
// 		}, 10 * 1000)
// 	},

// }	


// function removeOldApps() {
  
// }

// function updateUsersHolidays () {
// 	console.log('updating users\' holudiays')
// 	Business.find({}, 'holidays', (err, businesses) => {
// 		fs.readFile(filePath, 'utf8', (err, data) => {
// 			if (err) throw err;
// 			const holidayList = JSON.parse(data);
// 			businesses.forEach((business) => {
// 				business.holidays = holidayList;
// 			});
// 		});
// 	});
// }






