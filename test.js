const request = require('request');
const assert = require('assert');
const {expect} = require('chai');
const {should} = require('chai');
const scheduler = require('./config/scheduler');


it('Schedule', function() {
  expect(scheduler.setTime()).to.equal(200);
});


// it('Main page content', function(done) {
//     request('http://localhost:3000' , function(error, response, body) {
//         expect(body).to.equal('Hello World');
//         done();
//     });
// });










