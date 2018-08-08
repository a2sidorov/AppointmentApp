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
  if (!dateObj) {
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

  const todayDate = new Date();
  todayDate.setHours(0);
  todayDate.setMinutes(0);
  todayDate.setSeconds(0);
  todayDate.setMilliseconds(0);
  let i;
  let day = {}; 
  let days = [];
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth();
  const lastDay = new Date(year, month + 1, 0).getDate();
  let firstMonday = new Date(year, month, 1).getDay();
  firstMonday = (firstMonday === 0) ? 7 : firstMonday;
    for (i = 1 - firstMonday + 1; i <= lastDay; i++) {
      day = {};
      if (i > 0) {
        dateObj.setDate(i);
        console.log(dateObj.toISOString().substring(0, 10));
        if (dateObj.getTime() >= todayDate.getTime() 
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
};

businessSchema.methods.createDay = function(dateObj) {
  let availableWorkhours = this.workhours.filter((hour) => {
    return hour.isAvailable;
  });
  let activeAppointments = this.appointments.map((appointment) => {
    if (!appointment.canceled) {
       return appointment.date;
    }
  });
  availableWorkhours.forEach((hour) => {
    let h = parseInt(hour.time.substring(0, 2));
    let m = parseInt(hour.time.substring(3, 5));
    dateObj.setHours(h);
    dateObj.setMinutes(m);
    //console.log('dateObj.toISOString()' + dateObj.toISOString());
    //console.log(`${dateObj.getHours()} ${new Date().getHours()}`);
    //console.log((dateObj.getTime() - new Date().getTime())/(60 * 1000));
    if (activeAppointments.includes(dateObj.toISOString()) || (dateObj.getTime() - new Date().getTime()) < (30 * 60 * 1000)) {
      hour.isUnavailable = true;
    }
  });
  //console.log((dateObj.getTime() - new Date().getTime())/(60 * 1000));
  //console.log('availableWorkhours' + JSON.stringify(availableWorkhours));
  return availableWorkhours;
}

module.exports = User.discriminator('Business', businessSchema);