'use strict';

/* Sign Up */
function signup() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const confirm = document.getElementById('confirm').value;
  const isBusiness = document.getElementById('isBusiness').checked;
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
      location.href = '/home';
    }
  };
  
  xhttp.open('POST', '/signup', true);
  xhttp.setRequestHeader('Content-Type', 'application/json');
  const data = JSON.stringify({
    email: email,
    password: password,
    confirm: confirm,
    isBusiness: isBusiness,
    timezone: moment.tz.guess(),
  });
  xhttp.send(data);
}
