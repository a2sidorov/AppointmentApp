/*
function func1 (cb) {
	return cb();
}

let func2 = function () {
	return 'works';
};

console.log(func1(func2));


const holidays = require('./googleapi');
holidays((data) => {
  console.log(data);
});

const fs = require('fs');

fs.readFile('holidays', 'utf8', (err, data) => {
  if (err) throw err;
  let dataParsed = JSON.parse(data);
  let date = new Date(dataParsed[0].date);
  let dateFormated = date.toDateString();
  console.log(dateFormated);
})


console.log(`max ${new Date(new Date().getFullYear(), 11, 32).toISOString()}`);
console.log(`min ${new Date(new Date().getFullYear(), 0, 2).toISOString()}`);
*/

let d = new Date();
console.log(d.getDate());
console.log(d.toISOString().slice(0, 10));
console.log(d.toLocaleDateString());