'user strict';

const schedule = require('node-schedule');
const holidays = require('./holidays');

const removeOldAppointmentsNightly = schedule.scheduleJob('* 1 * * *', () => { // at 1:00 AM every night
  utils.removeOldAppointments()
    .then((result) => console.log(`Removed ${result}`))
    .catch(err => console.error(err));
});

const updateHolidaysFileYearly = schedule.scheduleJob('* 1 1 1 *', () => { // at 1:00 AM on January 1st every year
  holidays.fetchData()
    .then(data => holidays.writeToFile(holidays.filterResponse(data)))
    .then(() => console.log('File holidays have been updated'))
    .catch(err => console.error(err));
});

const updateUsersHolidaysYearly = schedule.scheduleJob('* 2 1 1 *', () => { // at 2:00 AM on January 1st every year
  utils.updateUsersHolidays()
    .then(() => console.log('Users holidays have been updated.'))
    .catch(err => console.error(err));
});


