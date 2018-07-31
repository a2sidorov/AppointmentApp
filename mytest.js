let DateObj = new Date();
DateObj.setMonth(7);
DateObj.setDate(1);
DateObj.setHours(8);
DateObj.setMinutes(0);
DateObj.setSeconds(0);
DateObj.setMilliseconds(0);

//let date = DateObj.toISOString()


let Appointments = [ { _id: '5b6011c51b47c61bca9ac04e',
    user: '5b5fe26009665b12e7618a7e',
    business: '5b5fe21a09665b12e7618a7c',
    date: '2018-08-01T01:00:00.000Z',
    reason: '',
    __v: 0 }, 
    { _id: '5b6011c51b47c61bca9ac04e',
    user: '5b5fe26009665b12e7618a7e',
    business: '5b5fe21a09665b12e7618a7c',
    date: '2018-08-01T02:00:00.000Z',
    reason: '',
    __v: 0 }];
 
function createDay(dateObj, appointments) {
  let appArr = appointments.map((item) => { 
    return item.date;
  });
  function checkApp(time) {
  	let hh = parseInt(time.substring(0, 2));
  	let mm = parseInt(time.substring(3));
  	DateObj.setHours(hh);
  	DateObj.setMinutes(mm);
    return !appArr.includes(DateObj.toISOString());
  }
  return ["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00"].filter(checkApp);
}

console.log(createDay(DateObj, Appointments));