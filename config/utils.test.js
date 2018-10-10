'use strict';

const assert = require('chai').assert;
const mongoose = require('mongoose');
const utils = require('./utils');
const Appointment = require('../models/appointment');
const Business = require('../models/business');

describe('utils test', () => {
  before(async () => {
    await mongoose.connect('mongodb://localhost:27017/unit_tests', { useNewUrlParser: true });
  });
  describe('removeOldAppointments', () => {
    let oldAppointmentId;
    let notOldAppointmentId;
    before(async () => {
      const oldAppointment = new Appointment();
      oldAppointment.timeMs = Date.now();
      const result = await oldAppointment.save();
      oldAppointmentId = result._id
    });
    before(async () => {
      const notOldAppointment = new Appointment();
      notOldAppointment.timeMs = Date.now() + (60 * 1000);
      const result = await notOldAppointment.save();
      notOldAppointmentId = result._id
    });
    it('should delete old appointments', async () => {
      await utils.removeOldAppointments();
      const result = await Appointment.findById(oldAppointmentId);
      assert.isNull(result);
    });
    it('should not delete future appointments', async () => {
      const result = await Appointment.findById(notOldAppointmentId);
      assert.isNotNull(result);
    });
    after( async () => {
      await Appointment.remove({});
    });
  });
  describe('updateUsersHolidays test', () => {
    before( async () => {
      for (let i = 0; i < 3; i++) { // creating thre test users
        const testUser = new Business();
        testUser.local.email = `testUser${i}@test.com`;
        testUser.local.password = 'password';
        testUser.holidays = [{testData:'testData'}];
        await testUser.save();
      }
    });
    it('should update the holidays property of testUser0', async () => {
      await utils.updateUsersHolidays();
      const business = await Business.findOne({ 'local.email': 'testUser0@test.com' });
      assert.deepEqual(Object.keys(business.holidays[0]), ['date', 'name', 'isAvailable']);
    });
    it('should update the holidays property of testUser1', async () => {
      await utils.updateUsersHolidays();
      const business = await Business.findOne({ 'local.email': 'testUser1@test.com' });
      assert.deepEqual(Object.keys(business.holidays[0]), ['date', 'name', 'isAvailable']);
    });
    it('should update the holidays property of testUser2', async () => {
      await utils.updateUsersHolidays();
      const business = await Business.findOne({ 'local.email': 'testUser2@test.com' });
      assert.deepEqual(Object.keys(business.holidays[0]), ['date', 'name', 'isAvailable']);
    });
    after( async () => {
      await Business.remove({});
    });
  });
  
});
