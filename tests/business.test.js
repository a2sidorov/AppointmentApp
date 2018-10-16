'use strict';
const assert = require('chai').assert;
const moment = require('moment-timezone');
const Business = require('../models/business');

describe('Business model test', () => {
  let newBusiness;

  before(async () => {
    newBusiness = new Business();
    newBusiness.local.email = 'test@test.com';
    newBusiness.local.password = 'password';;
    await newBusiness.setHolidays();
    //newBusiness.timezone = 'Europe/Moscow';
    newBusiness.timezone = 'America/New_York';
  });

  describe('workdays test', () => {
    it('should be an array', () => {
      assert.isArray(newBusiness.workdays);
    });
    it('should have length 7', () => {
      assert.lengthOf(newBusiness.workdays, 7);
    });
  });

  describe('workhours test', () => {
    it('should be an array', () => {
      assert.isArray(newBusiness.workhours);
    });
    it('should have length 48', () => {
      assert.lengthOf(newBusiness.workhours, 48);
    });
  });

  describe('holidays test', () => {
    it('should be an array', () => {
      assert.isArray(newBusiness.holidays);
    });
    it('should not be empty', () => {
      assert.deepEqual(Object.keys(newBusiness.holidays[0]), ['date', 'name', 'isAvailable']);
    });
  });

  describe('appointments test', () => {
    it('should return an array', () => {
      assert.isArray(newBusiness.appointments);
    });
  });

  describe('createMonth method test', () => {
    it('it should return an array', () => {
      assert.isArray(newBusiness.createMonth());
    });
    it('with arguments DST ON', () => {
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
      const m = moment();
      assert.isArray(newBusiness.createDay(m.format('YYYY-MM-DD')));
    });
    it('should return an array DST on', () => {
      const m = moment();
      m.add(1, 'year');
      m.month(7);
      assert.isArray(newBusiness.createDay(m.format('YYYY-MM-DD')));
    });
    it('should return an array DST off', () => {
      const m = moment();
      m.month(11);
      assert.isArray(newBusiness.createDay(m.format('YYYY-MM-DD')));
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
      
      assert.isBoolean(newBusiness.isBooked());
    });
  });

  describe('isLate method test', () => {
    it('should return boolean', function (done) {
      const dateString = moment().tz(newBusiness.timezone).format();
      console.log(dateString)
      assert.isBoolean(newBusiness.isLate(dateString));
      done();
    });
  });
});

