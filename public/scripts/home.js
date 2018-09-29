/* Client home */

function cancel(el, appointmentId) {
	const xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
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