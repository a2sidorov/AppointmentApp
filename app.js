const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Customer = require('./models/customer')
let port = process.env.PORT || 3000;

const app = express();

//connecting to db via mongoose and defining a Schema
mongoose.connect('mongodb://localhost/mydb');

//init data object
let curDate = new Date(),
year = curDate.getFullYear(),
month = curDate.getMonth(),
today = curDate.getDate(),
monday = curDate.getDay();

//testing db query
let timeArr = [];
Customer.find({}, (err, customer) => {
		if(err) throw err;
		for (let i = 0; i < customer.length; i++){
			timeArr.push(customer[i].time);
		}
		console.log(`timeArr = ${timeArr}`);
});



function getWeek(year, month, day){
	let week =[],
	temp = [],
	date;	
	for(let d = 0; d <= 6; d++){
	date = new Date(year, month, (today - monday + 1) + d).toDateString();
	temp.push(date);
		for(let h = 8; h <= 17; h++){
			if(timeArr.includes(`${date} ${h}:00`)) {
				temp.push('Booked');
			} else {
				temp.push(`${h}:00`);
			}
		}
		week.push(temp);
		temp = [];
	}
	
	return week;
}

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.use('/public', express.static('public'));
app.use(morgan('combined'))
app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());


app.get('/', (req, res) => {
	res.render('index', {
		week: getWeek(year, month, today)
	});
});
app.get('/nextweek', (req, res) => {
	today += 7;
	res.render('index', {
		week: getWeek(year, month, today)
	});
});
app.get('/prevweek', (req, res) => {
	today -= 7;
	res.render('index', {
		week: getWeek(year, month, today)
	});
});
app.post('/', (req, res) => {
	let post = new Customer({
		name: req.body.name,
		phone: req.body.phone,
		email: req.body.email,
		reason: req.body.reason,
		ins: req.body.ins,
		time: req.body.time
	})
	post.save(function(err, post){
		if(err) throw err;
		res.redirect('/');
	})
});
app.listen(3000, () => {
	console.log(`listening on port ${port}`);
});

//changing something!!!
//another change