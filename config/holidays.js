'use strict';

const {google} = require('googleapis');
const fs = require('fs');
const path = require('path');

const calendar = google.calendar({
  version: 'v3',
  auth: process.env.CALENDAR_KEY,
});

module.exports = {
	updateFile: function() {
	// calendar.events.list({
	// 	calendarId: 'en.usa#holiday@group.v.calendar.google.com',
	// 	timeMax: new Date(new Date().getFullYear(), 11, 32).toISOString(), 
	// 	timeMin: new Date(new Date().getFullYear(), 0, 2).toISOString(), 
	// 	//maxResults: 10,
	// 	singleEvents: true,
	// 	orderBy: 'startTime',
	// }, (err, data) => {
	// 	if (err) {
	// 		return console.log('The API returned an error: ' + err);
	// 	}
	// 	return console.log(data);
	// 	const events = data.items;
	// 	const holidays = events.map((event) => {
	// 		let start = event.start.dateTime || event.start.date;
	// 		let eventDate = { date: start, name: event.summary };
	// 		return eventDate;  
	// 	});
	// 	fs.writeFile(filePath, JSON.stringify(holidays), (err) => {
	// 		if (err) throw err;
	// 		console.log('The file has been saved!');
	// 	});
	// });
	},
	get: function(done) {
		fs.readFile(path.join(__dirname, 'holidays'), 'utf8', (err, data) => {
			if (err) throw err;
			done(JSON.parse(data));
		});
	},
	updateUsersHolidays() {
		console.log('updating users\' holudiays')
		Business.find({}, 'holidays', (err, businesses) => {
			fs.readFile(filePath, 'utf8', (err, data) => {
				if (err) throw err;
				const holidayList = JSON.parse(data);
				businesses.forEach((business) => {
					business.holidays = holidayList;
				});
			});
		});
	},

}







// module.exports = function (cb) {
// //function myFunc (cb) {
// 	fs.readFile(filePath, 'utf8', (err, data) => {
// 		if (err) throw err;
// 		let holidaysList = JSON.parse(data);
// 		let fileDate = new Date(holidaysList[holidaysList.length - 1].update);
		
// 		if (new Date().getFullYear() > fileDate.getFullYear() ) {
// 			console.log('making api request')
// 			calendar.events.list({
// 					calendarId: 'en.usa#holiday@group.v.calendar.google.com',
// 		  		timeMax: new Date(new Date().getFullYear(), 11, 32).toISOString(), 
// 		  		timeMin: new Date(new Date().getFullYear(), 0, 2).toISOString(), 
// 		  		//maxResults: 10,
// 		  		singleEvents: true,
// 		  		orderBy: 'startTime',
// 		  		}, (err, {data}) => {
// 		  			if (err) return console.log('The API returned an error: ' + err);
// 		  				let events = data.items;
// 		  				console.log(events);
// 		  				let holidaysListApi = events.map(function getHolidays (event) {
// 								let start = event.start.dateTime || event.start.date;
// 								let eventDate = { date: start, name: event.summary };
// 								return eventDate;  
// 								});
// 		  				console.log(holidaysListApi);
// 							holidaysListApi.push({ update: new Date().toISOString() }); 

// 							fs.writeFile(filePath, JSON.stringify(holidaysListApi), (err) => {
// 		   				if (err) throw err;
// 		   				console.log('The file has  been saved!');
// 		   				holidaysListApi.pop();
// 		   				cb(holidaysListApi);
// 							})
// 						});
// 		} else {
// 			console.log('reading holiday list from the file');
// 			holidaysList.pop();
// 			cb(holidaysList);
// 		}
// 	});
// }
// myFunc((data) => {
//   console.log(data);
// });