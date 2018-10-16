'use strict';
const assert = require('chai').assert;
const moment = require('moment-timezone');
//const mongoose = require('mongoose');
const Business = require('../models/business');


describe('Business model test', () => {
  let newBusiness;

  before(async () => {
    //mongoose.connect('mongodb://localhost:27017/mydb', { useNewUrlParser: true });
    newBusiness = new Business();
    newBusiness.local.email = 'test@test.com';
    newBusiness.local.password = 'password';;
    await newBusiness.setHolidays();
    //newBusiness.timezone = 'Europe/Moscow';
    newBusiness.timezone = 'America/New_York';
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

  describe.only('createMonth method test', () => {
    it('it should return an array', () => {
      assert.isArray(newBusiness.createMonth());
    });
    it.only('with arguments DST ON', () => {
      const m = moment();
      assert.isArray(newBusiness.createMonth(m.year(), 9));
    });
    it('with arguments DST OFF', () => {
      const m = moment();
      assert.isArray(newBusiness.createMonth(m.year(), 11));
    });
  });

  describe('createDay method test', () => {
    it('should return an array', () => {
      const date = moment().format('YYYY-MM-DD');
      assert.isArray(newBusiness.createDay(date));
    });
  });

  describe('isWorkday method test', () => {
    it('should return false if Sunday', () => {
      assert.isFalse(newBusiness.isWorkday(0));
    });
    it('should return true if Monday', () => {
      assert.isTrue(newBusiness.isWorkday(1));
    });
    it('should return false if Saturday', () => {
      assert.isFalse(newBusiness.isWorkday(6));
    });
  });

  describe('isHoliday method test', () => {
    it('should return true if date is holiday', () => {
      const date = moment().startOf('year');
      assert.isTrue(newBusiness.isHoliday(date.format('YYYY-MM-DD')));
    });
    it('should return false if date is not holiday', () => {
      const date = moment().startOf('year');
      date.add(1, 'day');
      assert.isFalse(newBusiness.isHoliday(date.format('YYYY-MM-DD')));
    });
  });

  describe('isBooked method test', () => {
    it('should return boolean', () => {
      assert.isBoolean(newBusiness.isBooked(new Date()));
    });
  });

  describe('isLate method test', () => {
    it('should return boolean', (done) => {
      assert.isBoolean(newBusiness.isLate(new Date()));
      done();
    });
  });
  /*
  after((done) => {
    mongoose.connection.close();
    done();
  });
  */
});

