/* Client search */
function findUser() {
  const pattern = searchBar.value;
  const searchResults = document.getElementById('searchResults');
  const message = document.getElementById('message');

  const xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      const parsedRes = JSON.parse(this.responseText);

      if (parsedRes.error) {
        displayError();
      }
      if (!parsedRes.success) {
        message.innerHTML = parsedRes.message;
      }
      if (parsedRes.success) {
        let div, list, listTxt, btn, btnTxt;
        parsedRes.results.forEach((result) => {
          div = document.createElement('div');
          div.classList.add('search-result');
          list = document.createElement('li');

          listTxt = document.createTextNode(result.local.email);

          list.appendChild(listTxt);
          btn = document.createElement('button');

          if (parsedRes.contacts.includes(result._id)) {
            btnTxt = document.createTextNode('Remove');
            btn.onclick = function() { removeUser(this, result._id) };
          } else {
            btnTxt = document.createTextNode('Add');
            btn.onclick = function() { addUser(this, result._id) };
          }

          btn.appendChild(btnTxt);
          div.appendChild(list);
          div.appendChild(btn);
          searchResults.appendChild(div);
        });
      }
    }
  }
  xhttp.open('POST', '/search', true);
  xhttp.setRequestHeader('Content-Type', 'application/json');
  const data = JSON.stringify({
    pattern: pattern,
  });
  xhttp.send(data);
}

function addUser(btn, id) {
  const xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      const parsedRes = JSON.parse(this.responseText);

      if (parsedRes.error) {
        displayError(parsedRes.message);
      }
      if (!parsedRes.success) {
        message.innerHTML = parsedRes.message;
      }
      if (parsedRes.success) {
        btn.innerHTML = 'Remove';
        btn.onclick = function() { removeUser(this, id) };
      }
    }
  };
  xhttp.open('POST', '/search/add', true);
  xhttp.setRequestHeader('Content-type', 'application/json');
  const data = JSON.stringify({
    id: id,
  });
  xhttp.send(data);
}


function removeUser(btn, id) {
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
      btn.innerHTML = 'Add';
      btn.onclick = function() { addUser(this, id) };
    }
  };
  xhttp.open('POST', '/search/remove', true);
  xhttp.setRequestHeader('Content-type', 'application/json');
  const data = JSON.stringify({
    id: id,
  });
  xhttp.send(data);
}