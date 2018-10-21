'use strict';

const assert = require('chai').assert;
const mongoose = require('mongoose');
const utils = require('../config/utils');
const Appointment = require('../models/appointment');
const Business = require('../models/business');
const moment = require('moment-timezone');

describe('utils test', () => {
  before(async () => {
    await mongoose.connect('mongodb://localhost:27017/unit_tests', { useNewUrlParser: true });
  });
  describe('removeOldAppointments', () => {
    let oldAppntId;
    let appntId;
    before(async () => {
      const oldAppnt = new Appointment();
      oldAppnt.businessEmail = 'test@test.dev';
      oldAppnt.userEmail = 'test@test.dev';
      oldAppnt.date = moment().format();
      oldAppnt.timestamp = moment().subtract(2, 'days').unix();
      const result = await oldAppnt.save();
      oldAppntId = result._id
    });
    before(async () => {
      const appnt = new Appointment();
      appnt.businessEmail = 'test@test.dev';
      appnt.userEmail = 'test@test.dev';
      appnt.date = moment().format();
      appnt.timestamp = moment().add(2, 'days').unix();
      const result = await appnt.save();
      appntId = result._id
    });
    it('should delete old appointments', async () => {
      const result = await utils.removeOldAppointments();
      assert.equal(result.n, 1);
    });
    it('should not delete future appointments', async () => {
      const result = await Appointment.findById(appntId);
      assert.isNotNull(result);
    });
    after( async () => {
      await Appointment.deleteMany({});
    });
  });
  describe('updateUsersHolidays test', () => {
    before( async () => {
      for (let i = 0; i < 3; i++) { // creating three test users
        const testUser = new Business();
        testUser.local.email = `testUser${i}@test.com`;
        testUser.local.password = 'password';
        testUser.holidays = [{ testData:'testData' }];
        testUser.timezone = moment.tz.guess(),
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
      await Business.deleteMany({});
    });
  });
  
});
