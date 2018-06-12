function addTime() {
	const nodeInput = document.createElement("INPUT");
	nodeInput.type = "text";
	nodeInput.name = "time";
	nodeInput.value = "00:00 AM";
	const brake = document.createElement("BR");
	document.getElementById("times").appendChild(nodeInput);
	document.getElementById("times").appendChild(brake);
}
function removeTime() {
	const times = document.getElementById("times");
	times.removeChild(times.lastElementChild);
	times.removeChild(times.lastElementChild);
}

function addExcTime() {
  const nodeInputTime = document.createElement("INPUT");
  nodeInputTime.type = "text";
  nodeInputTime.name = "exceptionTimes";
  nodeInputTime.value = "Monday 00:00 AM";
  const brake = document.createElement("BR");
  document.getElementById("excTime").appendChild(nodeInputTime);
  document.getElementById("excTime").appendChild(brake);
}
function removeExcTime() {
  const excTime = document.getElementById("excTime");
  excTime.removeChild(excTime.lastElementChild);
  excTime.removeChild(excTime.lastElementChild);
}

function addExcDate() {
  const nodeInputDate = document.createElement("INPUT");
  nodeInputDate.type = "date";
  nodeInputDate.name = "exceptionDates";
  nodeInputDate.value = `${new Date().getFullYear()}-01-01`;
  const brake = document.createElement("BR");
  document.getElementById("excDate").appendChild(nodeInputDate);
  document.getElementById("excDate").appendChild(brake);
}
function removeExcDate() {
  const excDate = document.getElementById("excDate");
  excDate.removeChild(excDate.lastElementChild);
  excDate.removeChild(excDate.lastElementChild);
}

