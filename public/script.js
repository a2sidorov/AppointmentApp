'use strict';

/*List of doctors*/
function dropdown(i) {
  document.getElementById(`dropdown-contentId${i}`).classList.toggle('show');
}

/*Side nav*/
function openNav() {
  console.log('works');
  document.getElementById("mySidenav").style.width = "250px";
}

/*Close the sidenav the list of doctors when clicking on page*/
// window.onclick = function(event) {
//   console.log(event.target);
//   if (!event.target.matches('#nav-btn') && 
//       !event.target.matches('.sidenav')) {

//     document.getElementById("mySidenav").style.width = "0";
//   }

//   if (!event.target.matches('.dropdown-content') && 
//       !event.target.matches('#dropdown-btnId')) {
//     if (document.getElementById("dropdown-contentId").classList.contains('show')) {
//       document.getElementById("dropdown-contentId").classList.remove('show');
//     }
//   }
// }

/*Profile workdays*/
function checkDay(element) {
  element.classList.toggle("checked");
  if (element.nextElementSibling.value) {
    element.nextElementSibling.value = null;
  } else {
    element.nextElementSibling.value = element.innerHTML;
  }
}

/*Profile workhours*/
function checkTime(element) {
  element.classList.toggle("checked");
  if (element.nextElementSibling.value) {
    element.nextElementSibling.value = null;
    console.log(element.nextElementSibling.dataset.time);
  } else {
    element.nextElementSibling.value = element.nextElementSibling.dataset.time;
    console.log(element.nextElementSibling.dataset.time);
  }
}

function addTime() {
  const nodeInput = document.createElement("INPUT");
  nodeInput.type = "text";
  nodeInput.name = "time";
  nodeInput.value = "00:00 AM";
  const brake = document.createElement("BR");
  document.getElementById("times").appendChild(nodeInput);
  document.getElementById("times").appendChild(brake);
}

function removeTime() {
  const times = document.getElementById("times");
  times.removeChild(times.lastElementChild);
  times.removeChild(times.lastElementChild);
}

function addExcDate() {
  const spanNode = document.createElement("SPAN");
  const inputNode = document.createElement("INPUT");
  inputNode.type = "date";
  inputNode.name = "exceptionDates";
  inputNode.value = `${new Date().getFullYear()}-01-01`;
  const btnNode = document.createElement("BUTTON");
  const txtNode = document.createTextNode("remove");
  btnNode.type = "button";
  btnNode.onclick = function () {
    const excDate = document.getElementById("excDate");
    excDate.removeChild(this.parentElement);
  }
  btnNode.appendChild(txtNode);
  spanNode.appendChild(inputNode);
  spanNode.appendChild(btnNode);
  document.getElementById("excDate").appendChild(spanNode);
}

