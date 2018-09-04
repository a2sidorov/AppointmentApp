'use strict';

/* Reset */
function reset() {
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
        message.innerHTML = parsedRes.message;
      }
    }
  };
  xhttp.open('POST', location.href, true);
  xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhttp.send(`password=${password}`);
}
