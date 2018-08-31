'use strict';

/* Client booking */
const appointment = {
  date: undefined,
  isDayChosen: false,
  isTimeChosen: false,
};
function getDays(dateISO, month) {
  if (appointment.date === undefined) {
    appointment.date = new Date(dateISO);
  }
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul','Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const days = document.getElementById('days');
  const xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      const responseObj = JSON.parse(this.responseText);
      //console.log('responseObj.DateObj ' + responseObj.DateObj);
      appointment.date = new Date(responseObj.dateISO);
      //console.log('DateObj ' + DateObj);
      document.getElementById('month').innerHTML = monthNames[appointment.date.getMonth()];
      removeChildren(days);
      let list, div, txt;
      responseObj.days.forEach((day) => {
        txt = document.createTextNode(day.num);
        div = document.createElement('DIV');
        list = document.createElement('LI');
        div.appendChild(txt);
        if (day.isAvailable) {
          div.classList.add('availableDays');
          div.onclick = function() {appointment.setDay(responseObj.dateISO, this)};
        }
        list.appendChild(div);
        days.appendChild(list);
      });
    }
  };
  xhttp.open('POST', `${window.location}/month`, true);
  xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhttp.send(`dateISO=${appointment.date.toISOString()}&month=${month}`);
}
function setDay(dateISO, el) {
  if (appointment.date === undefined) {
    appointment.date = new Date(dateISO);
  }
  const dayNum = el.innerHTML;
  checkDay(el);
  getTimetable(dayNum);
  appointment.isDayChosen = true;
}
function checkDay(el) {
  const checkedDay = document.getElementById('checkedDay');
  if (checkedDay && checkedDay !== el) {
    checkedDay.removeAttribute('id'); 
  }
  el.id = 'checkedDay';
}
function getTimetable(dayNum) {
  const timetable = document.getElementById('timetable');
  const xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      const responseObj = JSON.parse(this.responseText);
      appointment.date = new Date(responseObj.dateISO);
      removeChildren(timetable);
      let txt, list;
      responseObj.hours.forEach((hour) => {
        list = document.createElement('LI');
        txt = document.createTextNode(hour.time);
        if (!hour.isUnavailable) {
          list.classList.add('availableTime');
          list.onclick = function() {appointment.setTime(this)};
        }
        list.appendChild(txt);
        timetable.appendChild(list);
      });     
    }
  };
  xhttp.open("POST", `${window.location}/day`, true);
  xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhttp.send(`dateISO=${appointment.date.toISOString()}&day=${dayNum}`);
}
function setTime(el) {
  checkTime(el);
  const hour = (el.innerHTML).substring(0, 2);
  const minute = (el.innerHTML).substring(3);
  appointment.date.setHours(parseInt(hour));
  appointment.date.setMinutes(parseInt(minute));
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
    const reason = document.getElementById('reason').innerHTML;
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        console.log(this.responseText);
        let txt = document.createTextNode(this.responseText);
        let div = document.createElement('div');
        div.appendChild(txt);
        removeChildren(main);
        main.appendChild(div);
      }
    }
    xhttp.open("POST", `${window.location}/book`, true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send(`date=${appointment.date.toISOString()}&reason=${reason}`);
  } else {
    document.getElementById('msg').innerHTML = 'You have to choose day and time.';
  }
}

function showDropdown() {
  document.getElementById('content').classList.toggle("show");
}

