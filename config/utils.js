'use strict';

const holidays = require('./holidays');
const Appointment = require('../models/appointment');
const Business = require('../models/business');
const moment = require('moment-timezone');

module.exports = {
  
  removeOldAppointments: function() {
    return new Promise((resolve, reject) => {
      Appointment.deleteMany({ timestamp: { $lt: moment().unix() } }, (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });
    /*
    return new Promise((resolve, reject) => {
      //Appointment.deleteMany({ timeMs: { $lt: new Date().getTime() } }, (err, result) => {
      Appointment.deleteMany({ date: { $lt: new Date().getTime() } }, (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });
    */
  },
  
  updateUsersHolidays: function() {
    return new Promise((resolve, reject) => {
      Business.find({}, (err, result) => {
        if (err) reject(err);
        holidays.readFromFile().then((events) => {
          result.forEach((business) => {
            business.holidays = events;
            business.save((err) => {
              if (err) reject(err);
              resolve();
            });
          });
        });
      });
    });
  }
}
