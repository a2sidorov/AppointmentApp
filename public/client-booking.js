



function checkTime(clickedTime) {
  let input;
  let checkedTime = document.getElementById('checkedTime');
  console.log(clickedTime.getAttribute('data-time'));
  console.log(checkedTime);
  if (checkedTime) {
    checkedTime.removeAttribute("id");
    checkedTime.removeChild(checkedTime.childNodes[1]);
  }
  clickedTime.id = "checkedTime";
  input = document.createElement('INPUT');
  input.type = 'text';
  input.name = 'time';
  input.value = clickedTime.getAttribute("data-time");
  clickedTime.appendChild(input);
}



