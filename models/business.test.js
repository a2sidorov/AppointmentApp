'use strict';
const assert = require('chai').assert;

const mongoose = require('mongoose');
const Business = require('./business');

describe('Business model test', () => {
  let newBusiness;

  before((done) => {
    mongoose.connect('mongodb://localhost:27017/mydb', { useNewUrlParser: true });
    newBusiness = new Business();
    newBusiness.local.email = 'test@test.com';
    newBusiness.local.password = 'password';
    newBusiness.setHolidays();
    done();
  });

  describe('workdays test', () => {
    it('should be an array', (done) => {
      assert.isArray(newBusiness.workdays);
      done();
    });
    it('should have length 7', (done) => {
      assert.lengthOf(newBusiness.workdays, 7);
      done();
    });
  });

  describe('workhours test', () => {
    it('should be an array', (done) => {
      assert.isArray(newBusiness.workhours);
      done();
    });
    it('should have length 48', (done) => {
      assert.lengthOf(newBusiness.workhours, 48);
      done();
    });
  });

  describe('holidays test', () => {
    it('should be an array', (done) => {
      assert.isArray(newBusiness.holidays);
      done();
    });
    it('should not be empty', (done) => {
      assert.deepEqual(Object.keys(newBusiness.holidays[0]), ['date', 'name', 'isAvailable']);
      done();
    });
  });

  describe('appointments test', () => {
    it('should return an array', (done) => {
      assert.isArray(newBusiness.appointments);
      done();
    });
  });

  describe('createMonth method test', () => {
    it('should be an array', (done) => {
      assert.isArray(newBusiness.createMonth(new Date()));
      done();
    });
    it('should not be empty', (done) => {
      assert(newBusiness.createMonth(new Date()).length > 0);
      done();
    });
  });

  describe('createDay method test', () => {
    it('should return an array', (done) => {
      assert.isArray(newBusiness.createDay(new Date()));
      done();
    });
    it('should not be empty', (done) => {
      assert(newBusiness.createDay(new Date()).length > 0);
      done();
    });
  });

  describe('isWorkday method test', () => {
    it('should return boolean', (done) => {
      assert.isBoolean(newBusiness.isWorkday(new Date()));
      done();
    });
  });

  describe('isHoliday method test', () => {
    it('should return boolean', (done) => {
      assert.isBoolean(newBusiness.isHoliday(new Date()));
      done();
    });
  });

  describe('isBooked method test', () => {
    it('should return boolean', (done) => {
      assert.isBoolean(newBusiness.isBooked(new Date()));
      done();
    });
  });

  describe('isLate method test', () => {
    it('should return boolean', (done) => {
      assert.isBoolean(newBusiness.isLate(new Date()));
      done();
    });
  });

  after((done) => {
    mongoose.connection.close();
    done();
  });

});

