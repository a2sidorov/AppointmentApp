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
  const todayDate = new Date();
  todayDate.setHours(0);
  todayDate.setMinutes(0);
  todayDate.setSeconds(0);
  todayDate.setMilliseconds(0);
  const month = [];
  const yyyy = dateObj.getFullYear();
  const mm = dateObj.getMonth();
  const lastDay = new Date(yyyy, mm + 1, 0).getDate();
  let i;
  let day = {}; 
  let firstMonday = new Date(yyyy, mm, 1).getDay();
  firstMonday = (firstMonday === 0) ? 7 : firstMonday;
    for (i = 1 - firstMonday + 1; i <= lastDay; i++) {
      day = {};
      if (i > 0) {
        dateObj.setDate(i);
        //console.log(dateObj.toISOString().substring(0, 10));
        if (dateObj.getTime() >= todayDate.getTime() 
          && isWorkday(dateObj, this.workdays) 
          && !isHoliday(dateObj, this.holidays)) {
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
      month.push(day);
    }
  dateObj.setDate(1); 
  return month;
};

businessSchema.methods.createDay = function(dateObj) {
  const availableWorkhours = this.workhours.filter((hour) => {
    return hour.isAvailable;
  });
  availableWorkhours.forEach((hour) => {
    let h = parseInt(hour.time.substring(0, 2));
    let m = parseInt(hour.time.substring(3, 5));
    dateObj.setHours(h);
    dateObj.setMinutes(m);
    if (isBooked(dateObj, this.appointments) || isLate(dateObj)) {
      hour.isUnavailable = true;
    }
  });
  return availableWorkhours;
}

/*  Auxiliary functions */
function isWorkday (dateObj, workdays) {
  const workdaysArr = [];
  workdays.forEach((day) => {
    if (day.isAvailable) {
      workdaysArr.push(day.dayNum);
    }
  }); 
  return workdaysArr.includes(dateObj.getDay().toString());
}

function isHoliday (dateObj, holidays) {
  const holidaysArr = [];
  holidays.forEach((holiday) => {
    if (!holiday.isAvailable) {
      holidaysArr.push(holiday.date);
    }
  });
  return holidaysArr.includes(dateObj.toISOString().substring(0, 10));
}

function isBooked(dateObj, appointments) {
  const activeAppointments = appointments.map((appointment) => {
    if (!appointment.canceled) {
       return appointment.date;
    }
  });
  return activeAppointments.includes(dateObj.toISOString());
}

function isLate(dateObj) { 
  return (dateObj.getTime() - new Date().getTime()) < (30 * 60 * 1000); //checking if an appointment starts in less than 30 minutes;
}

module.exports = User.discriminator('Business', businessSchema);