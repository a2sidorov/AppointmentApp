'use strict';

/* Forgot */
function recover() {
  const email = document.getElementById('email').value;
  const message = document.getElementById('message');
  const xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState === 4 && this.status === 200) {
      const parsedRes = JSON.parse(this.responseText);
      console.log(parsedRes);
      message.innerHTML = parsedRes.message;
    }
  };
  xhttp.open('POST', '/forgot', true);
  xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhttp.send(`email=${email}`);
}
