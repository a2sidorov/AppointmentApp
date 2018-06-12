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


let d = new Date();
let mm = (d.getMonth() + 1).toString().length === 2 ? (d.getMonth() + 1).toString() : '0' + (d.getMonth() + 1).toString();
let dd = d.getDate().toString().length === 2 ? d.getDate().toString() : '0' + d.getDate().toString();
console.log(`${d.getFullYear()}-${mm}-${dd}`);
*/
console.log(new Date(2018, 6, 0).getDate());




