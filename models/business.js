'use strict';

const mongoose = require('mongoose');
const User = require('./user');
const options = require('./user');
const Appointment = require('../models/appointment');
const holidays = require('../config/holidays');

const businessSchema = new mongoose.Schema({
  workdays: { type: [mongoose.Schema.Types.Mixed], default: defaultWorkdays() },
  workhours: { type: [mongoose.Schema.Types.Mixed], default: defaultWorkhours() },
  holidays: [mongoose.Schema.Types.Mixed],
  appointments: [{type: mongoose.Schema.Types.ObjectId, ref: 'Appointment'}],
  suspended: { type: Boolean, default: false },
}, options);

function defaultWorkdays() {
  const workdays = [];
  for (let d = 0; d <= 6; d++) {
    if (d >= 1 && d <= 5) {
      workdays.push({dayNum: d.toString(), isAvailable: true});
    } else {
      workdays.push({dayNum: d.toString(), isAvailable: false});
    }     
  }
  return workdays;
}

function defaultWorkhours() {
  const workhours = [];
  for (let h = 0; h <= 24; h++) {
    if (h >= 8 && h <= 17) {
      workhours.push({time:`${h}:00`, isAvailable: true});
      workhours.push({time:`${h}:30`, isAvailable: false});
    } else {
      if (h !== 0) {
      workhours.push({time:`${h}:00`, isAvailable: false});
    }
    if (h === 24) break;
    workhours.push({time:`${h}:30`, isAvailable: false});
    }     
  } 
  return workhours;
}

businessSchema.methods.setHolidays = function() {
  holidays.readFromFile().then((events) => {
    events.forEach((event) => {
      event.isAvailable = false;
      this.holidays.push(event);
    });
  });
}

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
        if (dateObj.getTime() >= todayDate.getTime() 
          && this.isWorkday(dateObj) 
          && !this.isHoliday(dateObj)) {
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
  const availableWorkhours = this.workhours.filter(hour => hour.isAvailable);
  availableWorkhours.forEach((hour) => {
    let h = parseInt(hour.time.substring(0, 2));
    let m = parseInt(hour.time.substring(3, 5));
    dateObj.setHours(h);
    dateObj.setMinutes(m);
    if (this.isBooked(dateObj) || this.isLate(dateObj)) {
      hour.isAvailable = false;
    }
  });
  return availableWorkhours;
}

/*
businessSchema.methods.createDay = function(dateObj) {
  const availableWorkhours = this.workhours.filter((hour) => {
    return hour.isAvailable;
  });
  availableWorkhours.forEach((hour) => {
    let h = parseInt(hour.time.substring(0, 2));
    let m = parseInt(hour.time.substring(3, 5));
    dateObj.setHours(h);
    dateObj.setMinutes(m);
    if (this.isBooked(dateObj) || this.isLate(dateObj)) {
      hour.isUnavailable = true;
    }
  });
  return availableWorkhours;
}
*/
/*  Auxiliary functions */
businessSchema.methods.isWorkday = function(dateObj) {
  const workdaysArr = [];
  this.workdays.forEach((day) => {
    if (day.isAvailable) {
      workdaysArr.push(day.dayNum);
    }
  }); 
  return workdaysArr.includes(dateObj.getDay().toString());
}

businessSchema.methods.isHoliday = function(dateObj) {
  const holidaysArr = [];
  this.holidays.forEach((holiday) => {
    if (!holiday.isAvailable) {
      holidaysArr.push(holiday.date);
    }
  });
  return holidaysArr.includes(dateObj.toISOString().substring(0, 10));
}

businessSchema.methods.isBooked = function(dateObj) {
  const activeAppointments = this.appointments.map((appointment) => {
    if (!appointment.canceled) {
       return appointment.date;
    }
  });
  return activeAppointments.includes(dateObj.toISOString());
}

businessSchema.methods.isLate = function(dateObj) { 
  return (dateObj.getTime() - new Date().getTime()) < (30 * 60 * 1000); //checking if an appointment starts in less than 30 minutes;
}

module.exports = User.discriminator('Business', businessSchema);
