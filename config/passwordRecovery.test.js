'use strict';

const assert = require('chai').assert;
const passwordRecovery = require('./passwordRecovery');
const User = require('../models/user');
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/test', { useNewUrlParser: true });

describe('Testing password recovery', () => {
  before(async () => {
    const newUser = new User();
    newUser.local.email = 'test@test.dev';
    newUser.local.password = 'password';
    await newUser.save();
  });
  it('should an object', async () => {
    let result;
    result = await passwordRecovery('some@email.dev');
    assert.isObject(result);
  });
  it('should have property success false', async () => {
    let result;
    result = await passwordRecovery('some@email.dev');
    assert.isFalse(result.success);
  });
  it('', async () => {
    let result;
    result = await passwordRecovery('test@test.dev');
    console.log(result);
  });
//  it('should have property success true', async () => {
//    let result;
//    result = await passwordRecovery('test@test.dev');
//    assert.isTrue(result.success);
//  });
  after(async () => {
    await User.findOneAndRemove({ 'local.email': 'test@test.dev' });
  });
});
    

