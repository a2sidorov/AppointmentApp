'use strict';

const holidays = require('./holidays');
const Appointment = require('../models/appointment');
const Business = require('../models/business');

module.exports = {
  removeOldAppointments: async () => {
    try {
      return await Appointment.deleteMany({ timeMs: { $lt: new Date().getTime() } });
    } catch(err) {
      return err;
    }
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
  /*
  /.does not work
  updateUsersHolidays: async () => { 
    try {
      const businesses = await Business.find({});
      const newHolidays = await holidays.readFromFile();
      //console.log('businesses[0].holidays ' + businesses[0].holidays)
      //console.log('newHolidays ' + newHolidays)

      businesses.forEach(async (business) => {
        business.holidays = newHolidays;
        business.markModified('holidays');
        const res = await business.save(); // does not save first item in array
      });
      console.log('Holidays has been updated successfully')

    } catch(err) {
      return err;
    }
  }
  */
}
