const Customer = require('../models/customer');

module.exports = function(app, passport) {
	//init data object
let curDate = new Date(),
year = curDate.getFullYear(),
month = curDate.getMonth(),
today = curDate.getDate(),
weekDay = (curDate.getDay() === 0) ? 7 : curDate.getDay(),
initMonday = today - weekDay + 1,
curMonday = today - weekDay + 1;
let timeArr;

function getWeek (year, month, day){
	let week = [],
	temp = [],
	date;	
	for(let d = 0; d <= 6; d++){
	date = new Date(year, month, curMonday + d).toDateString();
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
//home page
app.get('/',(req, res) => {
	res.render('entrance', {
		message: req.flash('loginMessage')
	});
});
//login request
app.post('/login', function(req, res, next){
	passport.authenticate('local-login', function(err, user, info){
		if(err) {
			return next(err);
		}
		if(!user){
			return res.redirect('/');
		}
		req.logIn(user, function(err){
			if(err){return next(err);} 
			return res.redirect('/' + req.body.username);
		});
	})(req, res, next);
});
//signup page
app.get('/signup',(req, res) => {
	res.render('signup', {
		message: req.flash('signupMessage')
	});
});
//signup request
app.post('/signup', passport.authenticate('local-signup', {
	successRedirect : '/profile',
	failureRedirect : '/signup',
	failureFlash : true
}));
//profile page
app.get('/profile', isLoggedIn, function(req, res){
	res.render('profile', {
		user: req.user
	});
});
//logout request
app.get('/logout', function(req, res){
	req.logout();
	res.redirect('/');
});
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()){
        return next();
    }
    console.log(req.params.username);
    res.redirect('/');
}
//route for a doctor
app.get('/:username', (req, res) => {
	if(req.isAuthenticated()) {
		Customer.find({}, (err, customer,) => {
			if(err) throw err;
			timeArr = [];
			for (let i = 0; i < customer.length; i++){
				timeArr.push(customer[i].time);
			}
			res.render('user', {
				week: (getWeek(year, month, curMonday))
			});
		});	
	} else {
		Customer.find({}, (err, customer,) => {
			if(err) throw err;
			timeArr = [];
			for (let i = 0; i < customer.length; i++){
				timeArr.push(customer[i].time);
			}
			res.render('customer', {
				week: (getWeek(year, month, curMonday))
			});
		});	

	}
	
});
app.get('/nextweek', (req, res) => {
	curMonday += 7;
	res.redirect('/customer');
});
app.get('/prevweek', (req, res) => {
	if(curMonday - 7 >= initMonday){
		curMonday -= 7;
	}
	res.redirect('/customer');
});
app.post('/customer', (req, res) => {
	let post = new Customer({
		name: req.body.name,
		phone: req.body.phone,
		email: req.body.email,
		reason: req.body.reason,
		ins: req.body.ins,
		time: req.body.time
	});
	post.save(function(err){
		if(err) return console.error(err);
		res.redirect('/');
	})
});

}