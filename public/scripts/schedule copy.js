/* Business schedule */
const schedule = {
  message: document.getElementById('message'),
  saveBtn: document.getElementById(saveBtn),
  days: [],
  time: [],
  holidays: [],

  toggleStatus: function(btn) {
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
  },

  updateDays: function(el, dayNum, isAvailable) {
    el.classList.toggle('checked');
    saveBtn.style.display = 'block';
    const index = this.days.findIndex((day) => {
      return day.dayNum === dayNum;
    });
    if (index === -1) {
      isAvailable = JSON.parse(isAvailable) ? false : true;
      this.days.push({dayNum: dayNum, isAvailable: isAvailable});
    } else {
      this.days[index].isAvailable = this.days[index].isAvailable ? false : true;
    }
  },

  updateTime: function(el, time, isAvailable) {
    el.classList.toggle('checked');
    saveBtn.style.display = 'block';
    const index = this.time.findIndex((hour) => {
      return hour.time === time;
    });
    if (index === -1) {
      isAvailable = JSON.parse(isAvailable) ? false : true;
      this.time.push({time: time, isAvailable: isAvailable});
    } else {
      this.time[index].isAvailable = this.time[index].isAvailable ? false : true;
    }
  },

  updateHolidays: function(el, holidayDate, isAvailable) {
    el.classList.toggle('checked');
    saveBtn.style.display = 'block';
    const index = this.holidays.findIndex((event) => {
      return event.date === holidayDate;
    });
    if (index === -1) {
      isAvailable = JSON.parse(isAvailable) ? false : true;
      this.holidays.push({date: holidayDate, isAvailable: isAvailable});
    } else {
      this.holidays[index].isAvailable = this.holidays[index].isAvailable ? false : true;
    }
  },

  save: function() {
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
      days: this.days,
      time: this.time,
      holidays: this.holidays
    });
    xhttp.send(data);
  }
};