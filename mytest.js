let date = new Date();
// date.setMonth(0);
// date.setDate(0);
//date.setHours(0);
date.setMinutes(0);
date.setSeconds(0);
date.setMilliseconds(0);
time = '01:30';

let h = parseInt(time.substring(0, 2));
let m = parseInt(time.substring(3, 5));

console.log(h);
console.log(m);

let workhours = [{time:"0:30", isAvailable: false}, {time: "1:00", isAvailable: true}];

console.log(workhours);

function checkAvailable(hour) {
	return hour.isAvailable
}

availableWorkhours = workhours.filter((hour) => {
	return hour.isAvailable
});
console.log(availableWorkhours);

// console.log(new Date());
// console.log(date);
// console.log(date.toISOString());

