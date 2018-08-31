'use strict';

const {google} = require('googleapis');
const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'holidayList');

module.exports = {
  cached: undefined,
  fetchData: function() {
    return new Promise((resolve, reject) => {
      const calendar = google.calendar({
        version: 'v3',
        auth: 'AIzaSyBSIlWZPfU1EcP62SvePNCmgM1y_a0L65I', //process.env.CALENDAR_KEY,
      });
      calendar.events.list({
        calendarId: 'en.usa#holiday@group.v.calendar.google.com',
        timeMax: new Date(new Date().getFullYear(), 11, 32).toISOString(), 
        timeMin: new Date(new Date().getFullYear(), 0, 2).toISOString(), 
        //maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime',
      }, (err, data) => {
        if (err) reject(err);
        resolve(data);
      });
    });
  },
  filterResponse: function(res) {
    const events = res.data.items;
    let start, eventDate;
    const holidays = events.map((event) => {
      start = event.start.dateTime || event.start.date;
      eventDate = { date: start, name: event.summary };
      eventDate.isAvailable = false; //adding addtional property
      return eventDate;  
    });
    cached = holidays;
    return holidays;
  }, 
  writeToFile: function(data) {
    return new Promise((resolve, reject) => {
      fs.writeFile(filePath, JSON.stringify(data), (err) => {
        if (err) reject(err);
        resolve('Holidays are saved to the file');
      });
    });
  },
  readFromFile: function() {
    return new Promise((resolve, reject) => {
      if (this.cached) resolve(this.cached);
      fs.readFile(path.join(__dirname, 'holidayList'), 'utf8', (err, data) => {
        if (err) reject(err);
        resolve(JSON.parse(data));
      });
    });
  }
}
