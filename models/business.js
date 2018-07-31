'use strict';

const mongoose = require('mongoose');
const User = require('./user');
const options = require('./user');
const Appointment = require('../models/appointment');


const businessSchema = new mongoose.Schema({
	//isBusiness: Boolean,
  workhours: Array,
  workdays: Array,
  holidays: Array,
  exceptionDates: Array,
  clients: Array,
}, options);

businessSchema.methods.createMonth = function(dateObj) {
  const week = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
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
        date = new Date(year, month, i);
        weekDayNum =  date.getDay();
        if (date.getTime() > new Date().getTime() && this.workdays.includes(week[weekDayNum])) {
          day.num = i;
          day.app = true;
        } else {
          day.num = i;
          day.app = false;
        }
      } else {
        day.num = '';
        day.app = false;
      }
      days.push(day);
    }
  return days;
}




businessSchema.methods.createDay = function(dateObj) {
  let appArr = this.appointments.map((item) => { 
    return item.date.toISOString();
  });
  console.log('appArr ' + appArr);
  function availableTime(time) {
    let hh = parseInt(time.substring(0, 2));
    let mm = parseInt(time.substring(3));
    dateObj.setHours(hh);
    dateObj.setMinutes(mm);
    console.log('dateObj ' + dateObj);
    return !appArr.includes(dateObj.toISOString());
  }
  return this.workhours.filter(availableTime);
}




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