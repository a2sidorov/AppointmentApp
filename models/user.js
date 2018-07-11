'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const holidays = require('../config/googleapi');


const userSchema = mongoose.Schema({
	local: {
		username: { type: String, reqired: true, unique: true },
		email: { type: String, required: true, unique: true },
		password: { type: String, required: true },
    resetPasswordToken: String,
    resetPasswordExpires: Date
	},
  firstname: String,
  lastname: String,
  service: String,
  location: String,
  businesses: Array,
  isBusiness: Boolean,
  workhours: Array,
	workdays: Array,
  holidays: Array,
  exceptionDates: Array,
  clients: Array,
});

//adding a method to create a time table
/*
userSchema.methods.createSchedule = function (year, month, curMonday, user) {
  let week = [];
  let times = [];
  let date;
  let customerTimes = [];
  let mm, dd;

  for (let i = 0; i < this.customers.length; i++) {
    customerTimes.push(this.customers[i].time);
  }

  for (let d = 0; d < 7; d++) {
    times = [];
    date = new Date(year, month, curMonday + d);
    times.push(date.toDateString());
    mm = (date.getMonth() + 1).toString().length === 2 ? (date.getMonth() + 1).toString() : 
    '0' + (date.getMonth() + 1).toString();
    dd = date.getDate().toString().length === 2 ? date.getDate().toString() : '0' + date.getDate().toString();

    for (let i = 0; i < this.times.length; i++) {

      if (this.workdays.includes(getWeekDay(date)) && 
        !this.holidays.includes(date.toDateString()) &&
        !this.exceptionTimes.includes(`${getWeekDay(date)} ${this.times[i]}`) &&
        !this.exceptionDates.includes(`${date.getFullYear()}-${mm}-${dd}`)) {

        if (customerTimes.includes(`${date.toDateString()} ${this.times[i]}`)) {
          for (let j = 0; j < this.customers.length; j++) {
            if (`${date.toDateString()} ${this.times[i]}` === this.customers[j].time) {
              if (user) times.push(this.customers[j]);
              else times.push('booked');
            }
          }
        } else {
          times.push(this.times[i]);
        }
      } else {
        times.push('closed');
      }    
  }
  week.push(times);
  }
  return week;
}

//getting a weekday name from date; 
function getWeekDay (date) {
	let dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
	let dayNum = date.getDay();
	return dayNames[dayNum];
}
*/
//adding a method to create a month time table
userSchema.methods.createMonthSchedule = function (year, month, curMonday, user) {
  let days = [];
  let times = [];
  let date;
  let customerTimes = [];
  let mm, dd;
  let lastDay = new Date(year, month + 1, 0).getDate();
  let firstMonday = new Date(year, month, 1).getDay();
  firstMonday = (firstMonday === 0) ? 7 : firstMonday;
  console.log(firstMonday)

  /*
  for (let i = 0; i < this.customers.length; i++) {
    customerTimes.push(this.customers[i].time);
  }
  */

  for (let d = 1 - firstMonday + 1; d <= lastDay; d++) {
    
    if (d > 0) {
      times = [];
      date = new Date(year, month, d);
      times.push(d);

      //add times here

    } else {
      times.push("");
    }
    /*
    mm = (date.getMonth() + 1).toString().length === 2 ? (date.getMonth() + 1).toString() : 
    '0' + (date.getMonth() + 1).toString();
    dd = date.getDate().toString().length === 2 ? date.getDate().toString() : '0' + date.getDate().toString();

    for (let i = 0; i < this.times.length; i++) {

      if (this.workdays.includes(getWeekDay(date)) && 
        !this.holidays.includes(date.toDateString()) &&
          !this.exceptionTimes.includes(`${getWeekDay(date)} ${this.times[i]}`) &&
          !this.exceptionDates.includes(`${date.getFullYear()}-${mm}-${dd}`)) {

        if (customerTimes.includes(`${date.toDateString()} ${this.times[i]}`)) {
          for (let j = 0; j < this.customers.length; j++) {
            if (`${date.toDateString()} ${this.times[i]}` === this.customers[j].time) {
              if (user) times.push(this.customers[j]);
              else times.push('booked');
            }
          }
        } else {
          times.push(this.times[i]);
        }
      } else {
        times.push('closed');
      }    
  }
  */
  days.push(times);
  }
  return days;
}


//generating a hash
userSchema.methods.generateHash = function (password){
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

//checking if password is valid
userSchema.methods.validPassword = function (password){
	return bcrypt.compareSync(password, this.local.password);
};

module.exports = mongoose.model('User', userSchema);
