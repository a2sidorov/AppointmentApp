'use strict';

/* Nav bar*/
(function() {
  console.log(typeof window.location.pathname);
  const path = window.location.pathname;
  const patt = /\w+$/g;
  const endpoint = (path.match(patt));
  if (navbar.children.length === 3) {
    if (endpoint[0] === 'schedule') {
      navbar.children[1].className += " active";
    } else if (endpoint[0] === 'profile') {
      navbar.children[2].className += " active";
    } else {
    navbar.children[0].className += " active";
    }
  } else {
    if (endpoint[0] === 'search') {
      navbar.children[1].className += " active";
    } else if (endpoint[0] === 'book') {
      navbar.children[2].className += " active";
    } else if (endpoint[0] === 'contacts') {
      navbar.children[3].className += " active";
    } else if (endpoint[0] === 'profile') {
      navbar.children[4].className += " active";
    } else {
      navbar.children[0].className += " active";
    }
  }
})();

/* Client search */
function findUser() {
  let list, a, txt;
  let data = searchBar.value;
  let resultBox = document.getElementById("searchResult");
  removeChildren(resultBox);
  const xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      const obj = JSON.parse(this.responseText);
      obj.results.forEach((result) => {
        list = document.createElement("LI");
        a = document.createElement("A");
        a.href = `/search/${result._id}`;
        txt = document.createTextNode(result.local.username);
        a.appendChild(txt);
        list.appendChild(a);
        resultBox.appendChild(list);
      });
    }
  };
  xhttp.open("POST", "/search", true);
  xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhttp.send("username=" + data);
}

function removeChildren(e) {
  while(e.firstChild) {
    e.removeChild(e.firstChild);
  }
}

/* Client add contact */
// function addContact() {
//   let txt;
//   let contact = document.getElementById("contact").innerHTML;
//   let serverMsgBox = document.getElementById("serverMsgBox");
//   let addContactBtn = document.getElementById("addContactBtn");
//   const xhttp = new XMLHttpRequest();
//   xhttp.onreadystatechange = function() {
//     if (this.readyState == 4 && this.status == 200) {
//       txt = document.createTextNode(this.responseText);
//       removeChildren(serverMsgBox);
//       serverMsgBox.appendChild(txt);
//       addContactBtn.innerHTML = "Remove";
//       addContactBtn.onclick = removeContact;
//     }
//   };
//   xhttp.open("POST", `${location}/add`, true);
//   xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
//   xhttp.send("contact=" + contact);
// }

// /* Client remove contact */
// function removeContact() {
//   let txt;
//   let contact = document.getElementById("contact").innerHTML;
//   let serverMsgBox = document.getElementById("serverMsgBox");
//   let addContactBtn = document.getElementById("addContactBtn");
//   const xhttp = new XMLHttpRequest();
//   xhttp.onreadystatechange = function() {
//     if (this.readyState == 4 && this.status == 200) {
//       txt = document.createTextNode(this.responseText);
//       removeChildren(serverMsgBox);
//       serverMsgBox.appendChild(txt);
//       addContactBtn.innerHTML = 'Add';
//       addContactBtn.onclick = addContact;
//       console.log(addContactBtn.onclick);
     
//     }
//   };
//   xhttp.open("POST", `${location}/remove`, true);
//   xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
//   xhttp.send("contact=" + contact);
// }

/* Client booking */
function showDropdown(content) {
  document.getElementById(content).classList.toggle('show');
}

let DateObj;

function setMonth(monthBtn) {
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul","Aug", "Sep", "Oct", "Nov", "Dec"];
  let list, div, txt, responseObj;
  let firstAppDay = false;
  let year = document.getElementById('year'); 
  let month = document.getElementById('month'); 
  let days = document.getElementById('days'); 
  const xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      responseObj = JSON.parse(this.responseText);
      console.log('responseObj.DateObj ' + responseObj.DateObj);
      DateObj = new Date(responseObj.DateObj);
      console.log('DateObj ' + DateObj);
      year.innerHTML = DateObj.getFullYear();
      month.innerHTML = monthNames[DateObj.getMonth()];
      removeChildren(days);
      responseObj.days.forEach((day) => {
        txt = document.createTextNode(day.num);
        div = document.createElement('DIV');
        list = document.createElement('LI');
        div.appendChild(txt);
        list.appendChild(div);
        if (day.app && !firstAppDay) {
          firstAppDay = true;
          div.id = 'checkedDay';
          div.classList.add('appDays');
          div.onclick = function() {setDay(this)};
        } else if (day.app) {
          div.classList.add('appDays');
          div.onclick = function() {setDay(this)};
        } 
        days.appendChild(list);
      });
      setDay(document.getElementById('checkedDay'));
    }
  };
  xhttp.open("GET", `${location}/month/${monthBtn}`, true);
  xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhttp.send();
}

function setDay(el) {
  let dayNum, txt, p, list, responseObj;
  let time = document.getElementById('amTime');
  let firstElemen = true;
  let checkedDay = document.getElementById('checkedDay');
  if (el) {
    if (checkedDay && checkedDay !== el) {
      checkedDay.removeAttribute('id'); 
    }
    el.id = 'checkedDay';
    dayNum = el.innerHTML;
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        responseObj = JSON.parse(this.responseText);
        DateObj = new Date(responseObj.DateObj);
        removeChildren(time);
        responseObj.hours.forEach((hour) => {
          txt = document.createTextNode(hour);
          list = document.createElement('LI');
          list.appendChild(txt);
          list.onclick = function() {setTime(this)};
          if (firstElemen) {
            list.id = 'checkedTime';
            firstElemen = false;
          }
          time.appendChild(list);
        });
        setTime(document.getElementById('checkedTime'));        
      }
    };
    xhttp.open("GET", `${location}/day/${dayNum}`, true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send();
  } else {
    removeChildren(time);
    txt = document.createTextNode('No time available this month');
    p = document.createElement('P');
    p.appendChild(txt);
    time.appendChild(p);
  }
}

function setTime(el) {
  let checkedTime = document.getElementById('checkedTime');
  let dateInput = document.getElementById('dateInput');
  let hh, mm;
  if (el) {
    if (checkedTime && checkedTime !== el) {
      checkedTime.removeAttribute('id'); 
    }
    el.id = 'checkedTime';
    hh = (el.innerHTML).substring(0, 2);
    mm = (el.innerHTML).substring(3);
    DateObj.setHours(hh);
    DateObj.setMinutes(mm);
    DateObj.setSeconds(0);
  }
}

function book() {
  if (!DateObj) {
    msg.innerHTML = 'You have to choose date and time.';
  } else {
    let reason = document.getElementById('reason').innerHTML;
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        console.log(this.responseText);   
      }
    };
    xhttp.open("POST", `${location}/book`, true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send(`date=${DateObj.toISOString()}&reason=${reason}`);
  }
}



/* Schedule workdays/workhours */
function addInput(element, inputName) {
  let input;
  if (element.classList.contains('checked')) {
    element.classList.remove('checked');
    element.removeChild(element.childNodes[1]);
  } else {
    element.classList.add('checked');
    input = document.createElement('INPUT');
    input.type = 'text';
    input.name = inputName;
    input.value = element.getAttribute('data-time');
    element.appendChild(input);
  }
}

/* Schedule exception dates */
function addExcDate() {
  const container = document.createElement("DIV");
  const input = document.createElement("INPUT");
  input.type = "date";
  input.name = "exceptionDates";
  input.value = `${new Date().getFullYear()}-01-01`;
  const btn = document.createElement("BUTTON");
  const txt = document.createTextNode("remove");
  btn.type = "button";
  btn.onclick = function () {
    this.parentNode.remove();
  }
  btn.appendChild(txt);
  container.appendChild(input);
  container.appendChild(btn);
  document.getElementById("excDate").appendChild(container);
}

/* Profile */
function showBtn() {
  document.getElementById("saveBtn").style.display = 'block';
}





