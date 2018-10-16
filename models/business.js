'use strict';

const mongoose = require('mongoose');
const User = require('./user');
const options = require('./user');
const holidays = require('../config/holidays');
const moment = require('moment-timezone');

const businessSchema = new mongoose.Schema({
  workdays: { type: [mongoose.Schema.Types.Mixed], default: defaultWorkdays() },
  workhours: { type: [mongoose.Schema.Types.Mixed], default: defaultWorkhours() },
  holidays: [mongoose.Schema.Types.Mixed],
  //holidays: { type: [mongoose.Schema.Types.Mixed], default: defaultHolidays() },
  appointments: [{type: mongoose.Schema.Types.ObjectId, ref: 'Appointment'}],
  active: { type: Boolean, default: false },
  timezone: { type: String, required: true }
}, options);

function defaultWorkdays() {
  const workdays = [];
  for (let d = 1; d <= 7; d++) {
    if (d >= 1 && d <= 5) {
      workdays.push({dayNum: d, isAvailable: true});
    } else {
      if (d === 7) {
        workdays.push({dayNum: 0, isAvailable: false});
      } else {
        workdays.push({dayNum: d, isAvailable: false});
      }   
    }
  }
  return workdays;
}

function defaultWorkhours() {
  const workhours = [];
  for (let h = 0; h <= 24; h++) {
    if (h >= 8 && h <= 17) {
      workhours.push({time:`${h < 10 ? '0' + h : h}:00`, isAvailable: true});
      workhours.push({time:`${h < 10 ? '0' + h : h}:30`, isAvailable: false});
    } else {
      if (h !== 0) {
        workhours.push({time:`${h < 10 ? '0' + h : h}:00`, isAvailable: false});
      }
      if (h === 24) {
        break;
      }
      workhours.push({time:`${h < 10 ? '0' + h : h}:30`, isAvailable: false});
    }     
  } 
  return workhours;
}
/*
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
*/

businessSchema.methods.setHolidays = async function() {
  const events = await holidays.readFromFile();
  events.forEach((event) => {
    event.isAvailable = false;
    this.holidays.push(event);
  });
};

businessSchema.methods.createMonth = function(year, month) {
  let dateString = moment().tz(this.timezone).format();
  let m;
  if (year && month) {
    m = moment(dateString).year(year).month(month);
  } else {
    m = moment(dateString);
  }
  const today = moment(dateString);
  const days = [];
  //const lastDay = m.month(m.month() + 1).date(0).date();
  let day = {}; 

  let firstMonday = m.startOf('month').day();
  firstMonday = (firstMonday === 0) ? 7 : firstMonday;

  for (let i = 1 - firstMonday + 1; i <= m.daysInMonth(); i++) {
    day = {};
    if (i > 0) {
      m.date(i);
      if (m.isSameOrAfter(today, 'day') && 
      this.isWorkday(m.day()) && 
      !this.isHoliday(m.format('YYYY-MM-DD'))) {
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

  //dateObj.setDate(1);
  return days;
};

businessSchema.methods.createDay = function(date) { // arg: String YYYY-MM-DD
  //const m = moment({ year: year, month: month, day: day }).tz(this.timezone);

  const availableWorkhours = this.workhours.filter(hour => hour.isAvailable);
  availableWorkhours.forEach((hour) => {
    //let h = parseInt(hour.time.substring(0, 2));
    //let m = parseInt(hour.time.substring(3, 5));
    //m.hour(h);

    //dateObj.setHours(h);
    //dateObj.setMinutes(m);

    
    if (this.isBooked(date + ' ' + hour.time + '+0300') || this.isLate(date + ' ' + hour.time + '+0300')) {
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
businessSchema.methods.isWorkday = function(dayNum) { // arg: int
  const workdaysArr = [];
  this.workdays.forEach((day) => {
    if (day.isAvailable) {
      workdaysArr.push(day.dayNum);
    }
  }); 
  return workdaysArr.includes(dayNum);
}

businessSchema.methods.isHoliday = function(date) { // arg: String YYYY-MM-DD
  const holidaysArr = [];
  this.holidays.forEach((holiday) => {
    if (!holiday.isAvailable) {
      holidaysArr.push(holiday.date);
    }
  });
  return holidaysArr.includes(date);
}

businessSchema.methods.isBooked = function(time) { // arg: String YYYY-MM-DD HH:mm+-HHmm
  const activeAppointments = this.appointments.map((appointment) => {
    if (!appointment.canceled) {
       return appointment.date;
    }
  });
  return activeAppointments.includes(time);
}

businessSchema.methods.isLate = function(time) { // arg: String YYYY-MM-DD HH:mm+-HHmm

  //const test = moment().tz(this.timezone).format();

  const m = moment(time);
  //const m = moment(time);
  const currentMoment = moment().tz(this.timezone).format();
  return m.diff(currentMoment, 'minutes') < 30; //checking if an appointment starts in less than 30 minutes;
}

module.exports = User.discriminator('Business', businessSchema);
