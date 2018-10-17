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
    if (h >= 8 && h <= 21) {
      //workhours.push({time:`${h < 10 ? '0' + h : h}:00`, isAvailable: true});
      //workhours.push({time:`${h < 10 ? '0' + h : h}:30`, isAvailable: false});
      workhours.push({ hour: h, minute: 0, isAvailable: true });
      workhours.push({ hour: h, minute: 30, isAvailable: false });
    } else {
      if (h !== 0) {
        //workhours.push({time:`${h < 10 ? '0' + h : h}:00`, isAvailable: false});
        workhours.push({ hour: h, minute: 0, isAvailable: false });
      }
      if (h === 24) {
        break;
      }
      //workhours.push({time:`${h < 10 ? '0' + h : h}:30`, isAvailable: false});
      workhours.push({ hour: h, minute: 30, isAvailable: false });
    }     
  } 
  return workhours;
}

businessSchema.methods.setHolidays = async function() {
  const events = await holidays.readFromFile();
  events.forEach((event) => {
    event.isAvailable = false;
    this.holidays.push(event);
  });
};

businessSchema.methods.createMonth = function(dateString) { // arg: String YYYY-MM-DD HH:mm+-HHmm
  const m = moment.tz(dateString, this.timezone);

  const todayDateString = moment.tz(this.timezone).format();
  const days = [];
  let day = {}; 

  let firstMonday = m.startOf('month').day();
  firstMonday = (firstMonday === 0) ? 7 : firstMonday;

  for (let i = 1 - firstMonday + 1; i <= m.daysInMonth(); i++) {
    day = {};
    if (i > 0) {
      m.date(i);
      if (m.isSameOrAfter(todayDateString, 'day') && 
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

businessSchema.methods.createDay = function(dateString) { // arg: String YYYY-MM-DD HH:mm+-HHmm
  const m = moment.tz(dateString, this.timezone);
  const availableWorkhours = this.workhours.filter(hour => hour.isAvailable);
  //let localeDateAndTimeString;
  availableWorkhours.forEach((hour) => {
    m.hour(hour.hour);
    m.minute(hour.minute);
    //localeDateAndTimeString = moment.tz(localeDateString + ' ' + hour.time, this.timezone).format();
    if (this.isBooked(m.format()) || this.isLate(m.format())) {
        hour.isAvailable = false;
    }
  });
  return availableWorkhours;
}

/*  Auxiliary functions */
businessSchema.methods.isWorkday = function(dateString) { // arg: int day number
  const m = moment.tz(dateString, this.timezone);
  const workdaysArr = [];
  this.workdays.forEach((day) => {
    if (day.isAvailable) {
      workdaysArr.push(day.dayNum);
    }
  }); 
  return workdaysArr.includes(m.day());
}

businessSchema.methods.isHoliday = function(dateString) { // arg: String YYYY-MM-DD
  const m = moment.tz(dateString, this.timezone);
  const holidaysArr = [];
  this.holidays.forEach((holiday) => {
    if (!holiday.isAvailable) {
      holidaysArr.push(holiday.date);
    }
  });
  return holidaysArr.includes(m.format('YYYY-MM-DD'));
}

businessSchema.methods.isBooked = function(localeDateString) { // arg: String YYYY-MM-DDTHH:mm:ss+-HHmm
  const activeAppointments = this.appointments.map((appointment) => {
    if (!appointment.canceled) {
       return appointment.date;
    }
  });
  if (activeAppointments.length === 0) {
    return false;
  }

  return activeAppointments.every(time => moment(time).isSame(localeDateString, 'minutes'));
}

businessSchema.methods.isLate = function(localeDateString) { // arg: String YYYY-MM-DD HH:mm+-HHmm
  const currentMoment = moment.tz(this.timezone).format();
  return moment(localeDateString).diff(currentMoment, 'minutes') < 30; //checking if an appointment starts in less than 30 minutes;
}

module.exports = User.discriminator('Business', businessSchema);
