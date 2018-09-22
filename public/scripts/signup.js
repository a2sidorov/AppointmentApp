'use strict';

/* Sign Up */
function signup() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const confirm = document.getElementById('confirm').value;
  const message = document.getElementById('message');
  const xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      console.log(this.responseText);
      const parsedRes = JSON.parse(this.responseText);
      if (parsedRes.success) {
        location.href = '/home';
      } else {
        message.innerHTML = parsedRes.message;
      }
    }
  };
  xhttp.open('POST', '/signup', true);
  xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhttp.send(`email=${email}&password=${password}&confirm=${confirm}`);
}
