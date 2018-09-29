'use strict';

/* Reset */
function reset() {
  const password = document.getElementById('password').value;
  const confirm = document.getElementById('confirm').value;
  const message = document.getElementById('message');
  const xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState === 4 && this.status === 200) {
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
        message.innerHTML = parsedRes.message;
      }

      if (parsedRes.success) {
        const txt = document.createTextNode(parsedRes.message);
        const div = document.createElement('div');
        div.style.color = 'green';
        div.appendChild(txt);
        const login = document.createTextNode('Go to login page');
        const a = document.createElement('a');
        a.href = ('/');
        a.appendChild(login);
        removeChildren(main);
        main.appendChild(div);
        main.appendChild(a);
      } 
    }
  };
  xhttp.open('POST', location.href, true);
  xhttp.setRequestHeader("Content-type", "application/json");
  const data = JSON.stringify({
    password: password,
    confirm: confirm,
  });
  xhttp.send(data);
}
