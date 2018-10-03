/* Client home */

function cancel(el, appointmentId) {
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
      el.removeAttribute("onclick");
      el.innerHTML = 'Canceled';
      el.classList.remove('active');
      el.classList.add('canceled');
     }
  };
  xhttp.open('POST', `${window.location}/cancel`, true);
  xhttp.setRequestHeader("Content-type", "application/json");
  const data = JSON.stringify({
    appointmentId: appointmentId,
  });
  xhttp.send(data);
}