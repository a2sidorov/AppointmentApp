
const mongoose = require('mongoose');
const Business = require('./models/business');





mongoose.connect('mongodb+srv://test1:noldor1986@cluster0-fwxgm.mongodb.net/test?retryWrites=true/mydb');


const newBusiness = new Business();
  newBusiness.local.username = 'test';
  newBusiness.local.email = 'test@test.com';
  newBusiness.local.password = newBusiness.generateHash('test');
  newBusiness.save((err, business) => {
  if (err) throw err;
  });





