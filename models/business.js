'use strict';

const mongoose = require('mongoose');
const User = require('./user');
const options = require('./user');
const Appointment = require('../models/appointment');

let FirstAppDay;

const businessSchema = new mongoose.Schema({
  workdays: [mongoose.Schema.Types.Mixed],
  workhours: [mongoose.Schema.Types.Mixed],
  holidays: [mongoose.Schema.Types.Mixed],
  clients: [{type: mongoose.Schema.Types.ObjectId, ref: 'Business'}],
  appointments: [{type: mongoose.Schema.Types.ObjectId, ref: 'Appointment'}],
}, options);



businessSchema.methods.createMonth = function(dateObj) {
  if (dateObj == undefined) {
    dateObj = new Date();
  }

 let workdaysArr = [];
    this.workdays.forEach((day) => {
      if (day.isAvailable) {
        workdaysArr.push(day.dayNum);
      }
    });
    let holidaysArr = [];
    this.holidays.forEach((holiday) => {
      if (!holiday.isAvailable) {
        holidaysArr.push(holiday.date);
      }
    });

    let today = new Date();
    today.setHours(0);
    today.setMinutes(0);
    today.setSeconds(0);
    today.setMilliseconds(0);
    let i;
    let day = {}; 
    let days = [];
    let date;
    let weekDayNum;
    let year = dateObj.getFullYear();
    let month = dateObj.getMonth();
    let lastDay = new Date(year, month + 1, 0).getDate();
    let firstMonday = new Date(year, month, 1).getDay();
    firstMonday = (firstMonday === 0) ? 7 : firstMonday;
      for (i = 1 - firstMonday + 1; i <= lastDay; i++) {
        day = {};
        if (i > 0) {
          //date = new Date(year, month, i);
          dateObj.setDate(i);
          console.log(dateObj.toISOString().substring(0, 10));
          if (dateObj.getTime() >= today.getTime() 
            && workdaysArr.includes(dateObj.getDay().toString())
            && !holidaysArr.includes(dateObj.toISOString().substring(0, 10))
            ) {
            day.num = i;
            day.isAvailable = true;
          } else {
            day.num = i;
            day.isAvailable = false;
          }
        } else {
          day.num = '';
          day.isAvailable = false;
        }
          days.push(day);
      }
    dateObj.setDate(1);
    return days;
}

businessSchema.methods.createDay = function(dateObj) {
  let availableWorkhours = this.workhours.filter((hour) => {
    return hour.isAvailable;
  });
  let timeArr = [];
  let appArr = this.appointments.map((item) => { 
    return item.date;
  });
  console.log('appArr' + appArr);
  availableWorkhours.forEach((hour) => {
    let h = parseInt(hour.time.substring(0, 2));
    let m = parseInt(hour.time.substring(3, 5));
    dateObj.setHours(h);
    dateObj.setMinutes(m);
    console.log('dateObj.toISOString()' + dateObj.toISOString());
    if (appArr.includes(dateObj.toISOString())) {
      hour.isBooked = true;
    }
  });
  console.log('availableWorkhours' + availableWorkhours);
  return availableWorkhours;
}

// businessSchema.methods.createDay = function(dateObj) {
//   let result = [];
//   if (!dateObj) dateObj = FirstAppDay;
//   console.log('createDay ' + dateObj);
//   let appArr = this.appointments.map((item) => { 
//     return item.date.toISOString();
//   });
//   //console.log('appArr ' + appArr);
//   function availableTime(time) {
//     let hh = parseInt(time.substring(0, 2));
//     let mm = parseInt(time.substring(3));
//     dateObj.setHours(hh);
//     dateObj.setMinutes(mm);
//     //console.log('dateObj ' + dateObj);
//     return !appArr.includes(dateObj.toISOString());
//   }
//   result

//   return this.workhours.filter(availableTime);
// }




// businessSchema.methods.createMonthSchedule = function(year, month, curMonday, appointments) {
//   let curDate = new Date(),
//   yyyy = curDate.getFullYear(),
//   mm = curDate.getMonth(),
//   today = curDate.getDate();
//   let hh = curDate.getHours();
//   let min = curDate.getMinutes();
//   let days = [];
//   let time = [];
//   let date;
//   let dateStr;
//   let customerTimes = [];
//   let curDate1 = new Date(yyyy, mm, today); 
//   let lastDay = new Date(year, month + 1, 0).getDate();
//   let firstMonday = new Date(year, month, 1).getDay();
//   firstMonday = (firstMonday === 0) ? 7 : firstMonday;
//   console.log(`appointments:${this.appointments}`);

//   for (let d = 1 - firstMonday + 1; d <= lastDay; d++) {
//     if (d > 0) {
//       time = [];
//       date = new Date(year, month, d);
//       dateStr = date.toLocaleDateString();
//       time.push(dateStr);
//       if (this.workdays.includes(getWeekDay(date)) && date.toLocaleDateString() === curDate1.toLocaleDateString()) {
//         time.push(this.workhours.filter(currentTime));
//       } else if (this.workdays.includes(getWeekDay(date)) && date > curDate1) {
//         time.push(this.workhours);
//       } else {
//         time = [];
//         time.push("");
//       }
//     }
//     days.push(time);
//   }
//   return days;

// }

// function currentTime(time) {
//   let hh = new Date().getHours();
//   let min = new Date().getMinutes();
//   console.log(time);
//   console.log(`${hh} ${min}`);
//   console.log(parseInt(time.substring(0, 2), 10));
//   console.log(parseInt(time.substring(3), 10));
//   if (parseInt(time.substring(0, 2), 10) > hh) {
//     return time;
//   }
// }



module.exports = User.discriminator('Business', businessSchema);