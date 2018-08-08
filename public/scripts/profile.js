/* Client/business profile */
function updateProfile() {
  const firstname = document.getElementById('firstname').value;
  const lastname = document.getElementById('lastname').value;
  const xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      console.log(this.responseText);
      document.getElementById('saveBtn').style.display = 'none';
    }
  };
  xhttp.open('POST', `${window.location}/update`, true);
  xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhttp.send(`firstname=${firstname}&lastname=${lastname}`);
}

function showSaveBtn() {
  document.getElementById("saveBtn").style.display = 'block';
}