/* Client home */

function cancel(el, appointmentId) {
	const xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      console.log(this.responseText);
      el.removeAttribute("onclick");
      el.innerHTML = 'Canceled';
      el.classList.remove('active');
      el.classList.add('canceled');

     }
  };
  xhttp.open('POST', `${window.location}/cancel`, true);
  xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhttp.send(`appointmentId=${appointmentId}`);
}