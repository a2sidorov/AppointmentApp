/* Client/business profile */
function updateProfile() {
  const firstname = document.getElementById('firstname').value;
  const lastname = document.getElementById('lastname').value;
  const saveBtn = document.getElementById('saveBtn');
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
  saveBtn.style.display = 'block';
}