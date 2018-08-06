const appointment = {
  date: undefined,
  setMonth: function(monthBtn) {
    let list, div, txt, responseObj;
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul','Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let days = document.getElementById('days');
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        responseObj = JSON.parse(this.responseText);
        //console.log('responseObj.DateObj ' + responseObj.DateObj);
        appointment.date = new Date(responseObj.DateObj);
        //console.log('DateObj ' + DateObj);
        document.getElementById('year').innerHTML = appointment.date.getFullYear();
        document.getElementById('month').innerHTML = monthNames[appointment.date.getMonth()];
        removeChildren(days);
        responseObj.days.forEach((day) => {
          txt = document.createTextNode(day.num);
          div = document.createElement('DIV');
          list = document.createElement('LI');
          div.appendChild(txt);
          if (day.isAvailable) {
            div.classList.add('availableDays');
            div.onclick = function() {appointment.setDay(this)};
          }
          list.appendChild(div);
          days.appendChild(list);
        });
      }
    };
    xhttp.open("GET", `${window.location}/month/${monthBtn}`, true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send();
  },
  setDay: function(el) {
    let dayNum, txt, p, list, responseObj;
    let timetable = document.getElementById('timetable');
    let checkedDay = document.getElementById('checkedDay');
    if (checkedDay && checkedDay !== el) {
      checkedDay.removeAttribute('id'); 
    }
    el.id = 'checkedDay';
    dayNum = el.innerHTML;
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        responseObj = JSON.parse(this.responseText);
        appointment.date = new Date(responseObj.DateObj);
        removeChildren(timetable);
        responseObj.hours.forEach((hour) => {
          txt = document.createTextNode(hour);
          list = document.createElement('LI');
          list.appendChild(txt);
          
          if (!hour.isBooked) {
            list.classList.add('availableTime');
            list.onclick = function() {appointment.setTime(this)};
          }
          timetable.appendChild(list);
        });
        console.log(appointment.date);       
      }
    };
    xhttp.open("GET", `${window.location}/day/${dayNum}`, true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send();
  },
  setTime: function(el) {
    console.log(el);
    let checkedTime = document.getElementById('checkedTime');
    let hh, mm;
    if (checkedTime && checkedTime !== el) {
      checkedTime.removeAttribute('id'); 
    }
    el.id = 'checkedTime';
    hh = (el.innerHTML).substring(0, 2);
    mm = (el.innerHTML).substring(3);
    appointment.date.setHours(parseInt(hh));
    appointment.date.setMinutes(parseInt(mm));
    console.log(this.date);
  },
  book: function() {
    console.log(this.date);
    let div, txt, a;
    let main = document.getElementById('main');
    let msg = document.getElementById('msg');
    if (!this.date) {
      msg.innerHTML = 'You have to choose date and time.';
    } else {
      let reason = document.getElementById('reason').innerHTML;
      const xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          console.log(this.responseText);
          txt = document.createTextNode('back');
          a = document.createElement('a')
          a.href = window.location;
          a.appendChild(txt);
          msg = document.createTextNode(this.responseText);
          div = document.createElement('div');
          div.appendChild(msg);
          removeChildren(main);
          main.appendChild(a);
          main.appendChild(div);
        }
      }
      xhttp.open("POST", `${window.location}/book`, true);
      xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      xhttp.send(`date=${appointment.date.toISOString()}&reason=${reason}`);
    }
  },
};