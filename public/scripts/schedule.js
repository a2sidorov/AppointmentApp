/* Business schedule */
const schedule = {
  message: document.getElementById('message'),
  days: [],
  time: [],
  holidays: [],

  saveBtn: document.getElementById(saveBtn),
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
    console.log(this.days);
  },

  updateTime: function(el, time, isAvailable) {
    el.classList.toggle('checked');
    saveBtn.style.display = 'block';
    const index = this.time.findIndex((hour) => {
      return hour.time === time;
    });
    console.log('index ' + index);
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
    console.log(this.holidays);
  },

  save: function() {
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        const parsedRes = JSON.parse(this.responseText);
        if (parsedRes.error) {
          const txt = document.createTextNode(parsedRes.message);
          const div = document.createElement('div');
          div.style.color = 'red';
          div.appendChild(txt);
          removeChildren(main);
          main.appendChild(div);
        }
        if (!parsedRes.success) {
          console.log(parsedRes)
          schedule.message.innerHTML = parsedRes.message;
        }
        if (parsedRes.success) {
          saveBtn.style.display = 'none';
        }
      }
    };

    xhttp.open("POST", `${window.location}/update`, true);
    xhttp.setRequestHeader("Content-type", "application/json");
    const data = JSON.stringify({
      days: this.days,
      time: this.time,
      holidays: this.holidays
    });
    console.log(data)
    xhttp.send(data);
  }
};