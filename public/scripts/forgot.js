'use strict';

/* Forgot */
function sendEmail() {
  const email = document.getElementById('email').value;
  const message = document.getElementById('message');
  const main = document.getElementById('main');
  const xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState === 4 && this.status === 200) {
      const parsedRes = JSON.parse(this.responseText);
  
      if (parsedRes.error) {
        return message.innerHTML = parsedRes.message;
      } 

      if (!parsedRes.success) {
        return message.innerHTML = parsedRes.message;
      } 

      if (parsedRes.success) {
        const txt = document.createTextNode(parsedRes.message);
        const div = document.createElement('div');
        div.style.color = 'green';
        div.appendChild(txt);
        removeChildren(main);
        main.appendChild(div);
      } 
    }
  };
  xhttp.open('POST', '/forgot', true);
  xhttp.setRequestHeader("Content-type", "application/json");
  const data = JSON.stringify({
    email: email,
  });
  xhttp.send(data);
}


