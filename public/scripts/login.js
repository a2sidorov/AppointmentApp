'use strict';

/* Login */
function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const message = document.getElementById('message');
  const xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState === 4 && this.status === 200) {
      const parsedRes = JSON.parse(this.responseText);
      if (parsedRes.error) {
        message.innerHTML = parsedRes.message;
      }
      if (parsedRes.success) {
        location.href = '/home';
      } else {
        message.innerHTML = parsedRes.message;
      }
    }
  };
  xhttp.open('POST', '/login', true);
  xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhttp.send(`email=${email}&password=${password}`);
}
