function nextWeek(){
	let xhttp = new XMLHttpRequest();
	xhttp.open("GET", window.location.pathname + '/nextweek', true);
	xhttp.send();
}
