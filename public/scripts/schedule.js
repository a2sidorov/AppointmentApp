/* Business schedule */
const schedule = {
  days: [],
  time: [],
  holidays: [],
}

  function toggleStatus(btn) {
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
        schedule.active = parsedRes.active;
        btn.classList.toggle('active');
        btn.innerHTML = parsedRes.active ? 'Stop' : 'Start';
      }
    };
    xhttp.open("POST", '/schedule/active', true);
    xhttp.setRequestHeader("Content-type", "application/json");
    const data = JSON.stringify({
      active: btn.innerHTML === 'Start' ? true : false
    });
    xhttp.send(data);
  }

  function updateDays(el, num, isAvailable) {
    const saveBtn = document.getElementById('saveBtn');
    el.classList.toggle('checked');
    saveBtn.style.display = 'block';
    const index = schedule.days.findIndex((day) => {
      return day.num === num;
    });
    if (index === -1) {
      isAvailable = JSON.parse(isAvailable) ? false : true;
      schedule.days.push({num: num, isAvailable: isAvailable});
    } else {
      schedule.days[index].isAvailable = schedule.days[index].isAvailable ? false : true;
    }
  }

  function updateTime(el, hour, minute, isAvailable) {
    const saveBtn = document.getElementById('saveBtn');
    el.classList.toggle('checked');
    saveBtn.style.display = 'block';
    const index = schedule.time.findIndex((time) => {
      return time.hour === hour && time.minute === minute;
    });
    if (index === -1) {
      isAvailable = JSON.parse(isAvailable) ? false : true;
      schedule.time.push({hour: hour, minute: minute, isAvailable: isAvailable});
    } else {
      schedule.time[index].isAvailable = schedule.time[index].isAvailable ? false : true;
    }
  }

  function updateHolidays(el, holidayDate, isAvailable) {
    const saveBtn = document.getElementById('saveBtn');
    el.classList.toggle('checked');
    saveBtn.style.display = 'block';
    const index = schedule.holidays.findIndex((event) => {
      return event.date === holidayDate;
    });
    if (index === -1) {
      isAvailable = JSON.parse(isAvailable) ? false : true;
      schedule.holidays.push({date: holidayDate, isAvailable: isAvailable});
    } else {
      schedule.holidays[index].isAvailable = schedule.holidays[index].isAvailable ? false : true;
    }
  }

  function save() {
    const message = document.getElementById('message');
    const saveBtn = document.getElementById('saveBtn');
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
        saveBtn.style.display = 'none';
      }
    };
    xhttp.open("POST", '/schedule/update', true);
    xhttp.setRequestHeader("Content-type", "application/json");
    const data = JSON.stringify({
      days: schedule.days,
      time: schedule.time,
      holidays: schedule.holidays
    });
    xhttp.send(data);
  }