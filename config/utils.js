'use strict';

const holidays = require('./holidays');
const Appointment = require('../models/appointment');
const Business = require('../models/business');

module.exports = {
  removeOldAppointments: function() {
    return new Promise((resolve, reject) => {
      Appointment.deleteMany({ timeMs: { $lt: new Date().getTime() } }, (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });
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
