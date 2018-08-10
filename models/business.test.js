const assert = require('assert');
const {expect} = require('chai');
const {should} = require('chai');
const mongoose = require('mongoose');
const User = require('./user');
 
const Meme = require('./meme');
 
describe('meme', function() {
    it('should be invalid if name is empty', function(done) {
        var m = new Meme();
 
        m.validate(function(err) {
            expect(err).to.exist;
            done();
        });
    });
});


// describe('Database Tests', function() {

//   before((done) => {
//     var setupStub = sinon.stub(todo, 'setup')
//     done();
//   });

//   describe('Test Database',() => {
//     it('should save user', (done) => {
//       assert(1, 1);
//     }); 
//   });

//  after((done) => {

//   mongoose.connection.close();
//   done();
//  });
// });

