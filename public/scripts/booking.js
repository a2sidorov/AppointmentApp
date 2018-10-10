'use strict';

/* Client booking */
const appointment = {
  date: undefined,
  isDayChosen: false,
  isTimeChosen: false,
};
/* Setting month */
function getDays(dateISO, month) {
  if (appointment.date === undefined) {
    appointment.date = new Date(dateISO);
  }
  const monthNames = ["January", "February", "March", "April", "May", "June", "Jule","August", "September", "Octocber", "November", "December"];
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

      appointment.date = new Date(parsedRes.dateISO);
      document.getElementById('month').innerHTML = monthNames[appointment.date.getMonth()];
      removeChildren(days);

      let list, div, txt;
      parsedRes.days.forEach((day) => {
        txt = document.createTextNode(day.num);
        div = document.createElement('DIV');
        list = document.createElement('LI');
        div.appendChild(txt);
        if (day.isAvailable) {
          div.classList.add('availableDays');
          div.onclick = function() {setDay(parsedRes.dateISO, this)};
        }
        list.appendChild(div);
        days.appendChild(list);
      });
    }
  };
  xhttp.open('POST', `${window.location}/month`, true);
  xhttp.setRequestHeader("Content-type", "application/json");

  const data = JSON.stringify({
    dateISO: appointment.date.toISOString(),
    month: month,
  });
  xhttp.send(data);
}

/* Setting day */
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

      appointment.date = new Date(parsedRes.dateISO);
      removeChildren(timetable);

      let txt, list;
      parsedRes.hours.forEach((hour) => {
        list = document.createElement('LI');
        txt = document.createTextNode(hour.time);
        if (hour.isAvailable) {
          list.classList.add('availableTime');
          list.onclick = function() {setTime(this)};
        }
        list.appendChild(txt);
        timetable.appendChild(list);
      });     
    }
  };
  xhttp.open("POST", `${window.location}/day`, true);
  xhttp.setRequestHeader("Content-type", "application/json");
  const data = JSON.stringify({
    dateISO: appointment.date.toISOString(),
    day: dayNum,
  });
  xhttp.send(data);
}
/* Setting time */
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
      dateISO: appointment.date.toISOString(),
      reason: reason,
    });
    xhttp.send(data);
  } else {
    message.innerHTML = 'You have to choose day and time.';
  }
}

function showDropdown() {
  document.querySelector("[class*='other']").classList.toggle("show");
}


