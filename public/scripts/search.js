/* Client search */
function findUser() {
  const data = searchBar.value;
  const searchResults = document.getElementById('searchResults');
  removeChildren(searchResults); //shared functions
  const xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      const obj = JSON.parse(this.responseText);
      console.log(obj);
      let div, list, listTxt, btn, btnTxt;
      obj.results.forEach((result) => {
        div = document.createElement('div');
        div.classList.add('search-result');
        list = document.createElement('li');
        listTxt = document.createTextNode(result.local.username);
        list.appendChild(listTxt);
        btn = document.createElement('button');
        if (obj.contacts.includes(result._id)) {
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
  };
  xhttp.open('GET', `/search/${data}`, true);
  xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  xhttp.send();
}

function addUser(btn, id) {
  console.log(id);
  console.log('works');
  const xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      console.log(this.responseText);
      btn.innerHTML = 'Remove';
    }
  };
  xhttp.open('POST', '/search/add', true);
  xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  xhttp.send('id=' + id);
}

function removeUser(btn, id) {
  console.log(id);
  console.log('works');
  const xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      console.log(this.responseText);
      btn.innerHTML = 'Add';
    }
  };
  xhttp.open('POST', '/search/remove', true);
  xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  xhttp.send('id=' + id);
}