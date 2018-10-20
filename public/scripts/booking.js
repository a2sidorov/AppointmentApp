'use strict';

/* Client booking */
const appointment = {
  date: undefined,
  isDayChosen: false,
  isTimeChosen: false,
};
let currentMoment;

/* Clock */
function startClock(timezone) {
  appointment.date = moment.tz(timezone);
  currentMoment = moment.tz(timezone);
  setInterval(function() { 
    document.getElementById('clock').innerHTML = 
    'Today is ' + moment.tz(timezone).format('MMMM Do YYYY H:mm:ss') + 
    ' GMT('+ moment.tz(timezone).format('Z') +')';
  }, 1000);
}

/* Setting month */
function getDays(month) {
  if (month === "next") {
    appointment.date.add(1, 'months');
  } 
  if (month === "prev" && appointment.date.isSameOrAfter(currentMoment, 'month')) {
    appointment.date.subtract(1, 'months');
  } 
  
  const days = document.getElementById('days');
  const message = document.getElementById('message');
  const xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      const parsedRes = JSON.parse(this.responseText);
      
      if (parsedRes.error) {
        return displayError(parsedRes.message);
      }
      if (!parsedRes.success) {
        return message.innerHTML = parsedRes.message;
      }

      document.getElementById('year').innerHTML = appointment.date.format('YYYY');
      document.getElementById('month').innerHTML = appointment.date.format('MMMM');
      
      removeChildren(days);

      let list, div, txt;
      parsedRes.days.forEach((day) => {
        txt = document.createTextNode(day.num);
        div = document.createElement('DIV');
        list = document.createElement('LI');
        div.appendChild(txt);
        if (day.isAvailable) {
          div.classList.add('availableDays');
          div.onclick = function() { setDay(this); };
        }
        list.appendChild(div);
        days.appendChild(list);
      });
    }
  };
  xhttp.open('POST', `${window.location}/month`, true);
  xhttp.setRequestHeader("Content-type", "application/json");

  const data = JSON.stringify({
    date: appointment.date.format(),
  });
  xhttp.send(data);
}

/* Setting day */
function setDay(el) {
  appointment.date.date(parseInt(el.innerHTML));
  appointment.isDayChosen = true;
  const checkedDay = document.getElementById('checkedDay');

  if (checkedDay && checkedDay !== el) {
    checkedDay.removeAttribute('id'); 
  }
  el.id = 'checkedDay';

  const timetable = document.getElementById('timetable');
  const message = document.getElementById('message');
  const xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      const parsedRes = JSON.parse(this.responseText);
      
      if (parsedRes.error) {
        return displayError(parsedRes.message);
      }
      if (!parsedRes.success) {
        return message.innerHTML = parsedRes.message;
      }

      removeChildren(timetable);

      let txt, list;
      parsedRes.times.forEach((time) => {
        list = document.createElement('LI');
        txt = document.createTextNode(time.hour + ':' + (time.minute === 0 ? '0'+ time.minute : time.minute));
        if (time.isAvailable) {
          list.classList.add('availableTime');
          list.onclick = function() { setTime(this) };
        }
        list.appendChild(txt);
        timetable.appendChild(list);
      });     
    }
  };
  xhttp.open("POST", `${window.location}/day`, true);
  xhttp.setRequestHeader("Content-type", "application/json");
  const data = JSON.stringify({
    date: appointment.date.format(),
  });
  xhttp.send(data);
}
/* Setting time */
function setTime(el) {
  checkTime(el);
  const hour = (el.innerHTML).substring(0, 2);
  const minute = (el.innerHTML).substring(3);
  appointment.date.hour(parseInt(hour));
  appointment.date.minute(parseInt(minute));
  appointment.isTimeChosen = true;
}
function checkTime(el) {
  const checkedTime = document.getElementById('checkedTime');
  if (checkedTime && checkedTime !== el) {
    checkedTime.removeAttribute('id'); 
  }
  el.id = 'checkedTime';
}
function book() {
  if (appointment.isDayChosen && appointment.isTimeChosen) {
    const main = document.getElementById('main');
    const reason = document.getElementById('reason').value;
    const message = document.getElementById('message');
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        const parsedRes = JSON.parse(this.responseText);
      
      if (parsedRes.error) {
        return displayError(parsedRes.message);
      }
      if (!parsedRes.success) {
        return message.innerHTML = parsedRes.message;
      }
      let txt = document.createTextNode(parsedRes.message);
      let div = document.createElement('div');
      div.appendChild(txt);
      removeChildren(main);
      main.appendChild(div);
      }
    }


    xhttp.open("POST", `${window.location}/book`, true);
    xhttp.setRequestHeader("Content-type", "application/json");
    const data = JSON.stringify({
      date: appointment.date.format(),
      reason: reason,
    });
    xhttp.send(data);
  } else {
    message.innerHTML = 'You have to choose day and time.';
  }
}

function showDropdown() {
  console.log('showDropdown')
  document.querySelector("[class*='other']").classList.toggle("show");
}


