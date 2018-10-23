'user strict';

const schedule = require('node-schedule');
const holidays = require('./holidays');
const infoLog = require('./logger').infoLog;
const errorLog = require('./logger').errorLog;
const utils = require('./utils');

const removeOldAppointmentsNightly = schedule.scheduleJob('* 1 * * *', () => { // at 1:00 AM every night
  utils.removeOldAppointments()
    .then((result) => infoLog.info('Old appointments have been removed, qty: ' + result.n))
    .catch(err => errorLog.error(err));
});

const updateHolidaysFileYearly = schedule.scheduleJob('* 1 1 1 *', () => { // at 1:00 AM on January 1st every year
  holidays.fetchData()
    .then(data => holidays.writeToFile(holidays.filterResponse(data)))
    .then(() => infoLog.info('File holidays have been updated.'))
    .catch(err => errorLog.error(err));
});

const updateUsersHolidaysYearly = schedule.scheduleJob('* 2 1 1 *', () => { // at 2:00 AM on January 1st every year
  utils.updateUsersHolidays()
    .then(() => infoLog.info('Users holidays have been updated.'))
    .catch(err => errorLog.error(err));
});


/*
const testingInfoLog = schedule.scheduleJob('2 * * * * *', () => {
  infoLog.info('Info msg')
});
const testingErrorLog = schedule.scheduleJob('1 * * * * *', () => {
  const err = new Error('Test error');
  errorLog.error(err)
});
*/



