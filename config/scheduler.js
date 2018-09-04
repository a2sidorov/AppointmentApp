'user strict';

const schedule = require('node-schedule');
const holidays = require('./holidays');
const utils = require('./utils');

const removeOldAppointmentsNightly = schedule.scheduleJob('* 1 * * *', () => {
  utils.removeOldAppointments()
    .then((result) => console.info(`Removed ${result}`))
    .catch(err => console.error(err));
});

const updateHolidaysFileYearly = schedule.scheduleJob('* 1 1 1 *', () => {
  holidays.fetchData()
    .then(data => holidays.writeToFile(holidays.filterResponse(data)))
    .then(() => console.log('File holidays have been updated'))
    .catch(err => console.error(err));
});
