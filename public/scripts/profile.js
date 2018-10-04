/* Client/business profile */
function updateProfile() {
  const firstname = document.getElementById('firstname').value;
  const lastname = document.getElementById('lastname').value;
  const message = document.getElementById('message');
  const saveBtn = document.getElementById('saveBtn');
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
      saveBtn.style.display = 'none';
    }
  };
  xhttp.open('POST', `${window.location}/update`, true);
  xhttp.setRequestHeader("Content-type", "application/json");

  const data = JSON.stringify({
    firstname: firstname,
    lastname: lastname
  });
  xhttp.send(data);
}

function showSaveBtn() {
  document.getElementById('saveBtn').style.display = 'block';
}

function showDeleteForm() {
  document.getElementById('password').style.display = 'block';
  document.getElementById('deleteBtn').style.display = 'block';
}

function deleteAccount() {
  const password = document.getElementById('password').value;
  const message = document.getElementById('message');
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
      message.style.color = "green";
      message.innerHTML = parsedRes.message;
    }
  };
  xhttp.open('POST', `/profile/delete`, true);
  xhttp.setRequestHeader("Content-type", "application/json");

  const data = JSON.stringify({
    password: password,
  });
  xhttp.send(data);
 
}