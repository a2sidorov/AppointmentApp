//const Appointment = require('../models/appointment');

// function deleteOldAppoinments() {
//   Appointment.find({date: { $gt: 17, $lt: 66 },})
// }


console.log(new Date() < new Date(2025,1,1));
//setInterval(intervalFunc, 24 * 60 * 60);

let app1 = 1533603600000/(24*60*60*1000);
let app2 = 1533607200000/(24*60*60*1000);

let cur = 1533611121200/(24*60*60*1000);

console.log(cur + ' ' + app1);
console.log(cur + ' ' + app2);

console.log(cur - app1);
console.log(cur - app2);