'use strict';

const assert = require('chai').assert;
const mongoose = require('mongoose');
const utils = require('./utils');
const Appointment = require('../models/appointment');
const Business = require('../models/business');

describe('utils test', () => {
  before((done) => {
    mongoose.connect('mongodb://localhost:27017/test', { useNewUrlParser: true });
    done();
  });
  describe('removeOldAppointments', () => {
    let oldAppointmentId;
    let notOldAppointmentId;
    before((done) => {
      const oldAppointment = new Appointment();
      oldAppointment.timeMs = Date.now();
      oldAppointment.save((err, result) => {
        if (err) throw err;
        oldAppointmentId = result._id
        done();
      });
    });
    before((done) => {
      const notOldAppointment = new Appointment();
      notOldAppointment.timeMs = Date.now() + (60 * 1000);
      notOldAppointment.save((err, result) => {
        if (err) throw err;
        notOldAppointmentId = result._id
        done();
      });
    });
    it('should delete old appointments', (done) => {
      utils.removeOldAppointments().then(() => {
        Appointment.findById(oldAppointmentId, (err, result) => {
          if (err) throw err;
          assert.isNull(result);
          done();
        });
      });
    });
    it('should not delete future appointments', (done) => {
      Appointment.findById(notOldAppointmentId, (err, result) => {
        if (err) throw err;
        assert.isNotNull(result);
        done();
      });
    });
  });
  describe('updateUsersHolidays test', () => {
    before((done) => {
      const testSubjectOne = new Business();
      testSubjectOne.local.email = 'one@test.com';
      testSubjectOne.local.password = 'password';
      testSubjectOne.holidays = [{testData:'testData'}];
      testSubjectOne.save((err, result) => {
        if (err) throw err;
        const testSubjectTwo = new Business();
        testSubjectTwo.local.email = 'two@test.com';
        testSubjectTwo.local.password = 'password';
        testSubjectTwo.holidays = [{testData:'testData'}];
        testSubjectTwo.save((err, result) => {
          if (err) throw err;
          const testSubjectThree = new Business();
          testSubjectThree.local.email = 'three@test.com';
          testSubjectThree.local.password = 'password';
          testSubjectThree.holidays = [{testData:'testData'}];
          testSubjectThree.save((err, result) => {
            if (err) throw err;
            done();
          });
        });
      });
    });
    it('should update the holidays property of testSubjectOne', (done) => {
      utils.updateUsersHolidays().then(() => {
        Business.findOne({ 'local.email': 'one@test.com' }, (err, business) => {
          if (err) throw err;
          assert.deepEqual(Object.keys(business.holidays[0]), ['date', 'name']);
          done();
        });
      });
    });
    it('should update the holidays property of testSubjectTwo', (done) => {
      Business.findOne({ 'local.email': 'two@test.com' }, (err, business) => {
        if (err) throw err;
        assert.deepEqual(Object.keys(business.holidays[0]), ['date', 'name']);
        done();
      });
    });
    it('should update the holidays property of testSubjectThree', (done) => {
      Business.findOne({ 'local.email': 'three@test.com' }, (err, business) => {
        if (err) throw err;
        assert.deepEqual(Object.keys(business.holidays[0]), ['date', 'name']);
        done();
      });
    });
  });
  after((done) => {
    mongoose.connection.db.dropDatabase(function (err) {
      console.log('db dropped');
      done();
    });
  });
});
