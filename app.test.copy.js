'use strict';

const app = require ('./app');
const assert = require('chai').assert;
const request = require('supertest');
const session = require('supertest-session');
const sinon = require('sinon');
const User = require('./models/user');
const Business = require('./models/business');
const Appointment = require('./models/appointment');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const passwordReset = require('./config/passwordReset');

describe('Testing routes', () => {

  describe('GET /incorrectpath', () => {
    it('should have status 404', async () => {
      const res = await request(app)
				.get('/incorrectpath');
      assert.equal(res.statusCode, 404);
		});
  });
  
  describe('GET /', () => {
    it('should have status 200', async () => {
      const res = await request(app)
				.get('/');
      assert.equal(res.statusCode, 200);
    });
  });

  describe('POST /login', () => {
    before(async () => {
      const newUser = new User();
      newUser.local.email = 'test@test.com';
      newUser.local.password = newUser.generateHash('password');
      await newUser.save();
    });
    it('should fail if email or login contains unallowed characters', async () => {
      const res = await request(app)
				.post('/login')
				.set('Content-type', 'application/json')
				.send({
					email: {"$gt":""},
					password: {"$gt":""}
				});
      assert.isFalse(res.body.success);
    });
    it('should fail if no email sent', async () => {
      const res = await request(app)
				.post('/login')
				.set('Content-type', 'application/json')
				.send({
					password: 'password'
				});
      assert.isFalse(res.body.success);
    });
    it('should fail if email has not been signed up', async () => {
      const res = await request(app)
				.post('/login')
				.set('Content-type', 'application/json')
				.send({
					email: 'unsigned@email.com',
					password: 'password'
				});
      assert.isFalse(res.body.success);
    });
    it('should fail if no password sent', async () => {
      const res = await request(app)
				.post('/login')
				.set('Content-type', 'application/json')
				.send({
					email: 'test@test.com'
				});
      assert.isFalse(res.body.success);
    });
    it('should fail if password is incorrect', async () => {
      const res = await request(app)
				.post('/login')
				.set('Content-type', 'application/json')
				.send({
					email: 'test@test.com',
					password: 'incorrectPassword'
				});
      assert.isFalse(res.body.success);
    });
    it('should send an error as JSON if an error in User.findOne()', async () => {
      const findOne = sinon.stub(User, 'findOne');
      findOne.throws(new Error('test error'));
      const res = await request(app)
				.post('/login')
				.set('Content-type', 'application/json')
				.send({ email: 'test@test.com', password: 'password' });
						findOne.restore();
						assert.isTrue(res.body.error);
					});
    it('should succeed if email and password are correct', async () => {
      const res = await request(app)
				.post('/login')
				.set('Content-type', 'application/json')
				.send({
					email: 'test@test.com',
					password: 'password'
				});
      assert.isTrue(res.body.success);
    });
    after(async () => {
      await User.findOneAndRemove({ 'local.email': 'test@test.com' });
    });
  });

  describe('GET /signup', () => {
    it('should have status 200', async () => {
      const res = await request(app)
				.get('/signup');
      assert.equal(res.statusCode, 200);
    });
  });

  describe('POST /signup', () => {
    before(async () => {
      const newUser = new User();
      newUser.local.email = 'test@test.com';
      newUser.local.password = newUser.generateHash('password');
      await newUser.save();
    });
    it('should fail with no email sent', async () => {
      const res = await request(app)
				.post('/signup')
				.set('Content-type', 'application/json')
				.send({
					password: 'password',
					confirm: 'password'
				});
      assert.isFalse(res.body.success);
    });
    it('should fail with email Abc.example.com', async () => {
      const res = await request(app)
				.post('/signup')
				.set('Content-type', 'application/json')
				.send({
					email: 'Abc.example.com',
					password: 'password',
					confirm: 'password'
				});
      assert.isFalse(res.body.success);
    });
    it('should fail with email A@b@c@example.com', async () => {
      const res = await request(app)
				.post('/signup')
				.set('Content-type', 'application/json')
				.send({
					email: 'A@b@c@example.com',
					password: 'password',
					confirm: 'password'
				});
      assert.isFalse(res.body.success);
    });
    it('should fail with email a"b(c)d,e:f;g<h>i[j\k]l@example.com', async () => {
      const res = await request(app)
				.post('/signup')
				.set('Content-type', 'application/json')
				.send({
					email: 'a"b(c)d,e:f;g<h>i[j\k]l@example.com',
					password: 'password',
					confirm: 'password'
				});
      assert.isFalse(res.body.success);
    });
    it('should fail with email just"not"right@example.com', async () => {
      const res = await request(app)
				.post('/signup')
				.set('Content-type', 'application/json')
				.send({
					email: 'just"not"right@example.com',
					password: 'password',
					confirm: 'password'
				});
      assert.isFalse(res.body.success);
    });
    it('should fail with email this is"not\allowed@example.com', async () => {
      const res = await request(app)
				.post('/signup')
				.set('Content-type', 'application/json')
				.send({
					email: 'just"not"right@example.com',
					password: 'password',
					confirm: 'password'
				});
      assert.isFalse(res.body.success);
    });
    it('should fail with email this\ still\"not\\allowed@example.com ', async () => {
      const res = await request(app)
				.post('/signup')
				.set('Content-type', 'application/json')
				.send({
					email: 'this is"not\allowed@example.com',
					password: 'password',
					confirm: 'password'
				});
      assert.isFalse(res.body.success);
    });
    it('should fail with email 1234567890123456789012345678901234567890123456789012345678901234+x@example.com', async () => {
      const res = await request(app)
				.post('/signup')
				.set('Content-type', 'application/json')
				.send({
					email: '1234567890123456789012345678901234567890123456789012345678901234+x@example.com',
					password: 'password',
					confirm: 'password'
				});
      assert.isFalse(res.body.success);
    });
    it('should fail with email john..doe@example.com', async () => {
      const res = await request(app)
				.post('/signup')
				.set('Content-type', 'application/json')
				.send({
					email: 'john..doe@example.com',
					password: 'password',
					confirm: 'password'
				});
      assert.isFalse(res.body.success);
    });
    it('should fail with email john.doe@example..com', async () => {
      const res = await request(app)
				.post('/signup')
				.set('Content-type', 'application/json')
				.send({
					email: 'john..doe@example.com',
					password: 'password',
					confirm: 'password'
				});
      assert.isFalse(res.body.success);
    });
    it('should fail with password with characters other than a-zA-Z0-9@#', async () => {
      const res = await request(app)
				.post('/signup')
				.set('Content-type', 'application/json')
				.send({
					email: '{"$gt":""}',
					password: '{"$gt":""}',
					confirm: '{"$gt":""}'
				});
      assert.isFalse(res.body.success);
    });
    it('should fail with an incorrect confirmation password', async () => {
      const res = await request(app)
				.post('/signup')
				.set('Content-type', 'application/json')
				.send({
					email: 'test@test.com',
					password: 'password',
					confirm: 'password1'
				});
      assert.isFalse(res.body.success);
    });
    it('should fail with a password shorter than 6 characters', async () => {
      const res = await request(app)
				.post('/signup')
				.set('Content-type', 'application/json')
				.send({
					email: 'test@test.com',
					password: 'pass',
					confirm: 'pass'
				});
      assert.isFalse(res.body.success);
    });
    it('should fail with a password longer than 20 characters', async () => {
      const res = await request(app)
				.post('/signup')
				.set('Content-type', 'application/json')
				.send({
					email: 'test@test.com',
					password: '12345678901234567890a',
					confirm: '12345678901234567890a'
				});
      assert.isFalse(res.body.success);
    });
    it('should fail if email is already signed up', async () => {
      const res = await request(app)
				.post('/signup')
				.set('Content-type', 'application/json')
				.send({
					email: 'test@test.com',
					password: 'password',
					confirm: 'password'
				});
      assert.isFalse(res.body.success);
    });
    it('should send an error as JSON if an error in User.findOne()', async () => {
      const findOne = sinon.stub(User, 'findOne');
      findOne.throws(new Error('test error'));
      const res = await request(app)
				.post('/signup')
				.set('Content-type', 'application/json')
				.send({ 
					email: 'test1@test.com', 
					password: 'password', 
					confirm: 'password' });
			findOne.restore();
			assert.isTrue(res.body.error);
		});
    it('should succeed with valid email and password', async () => {
      const res = await request(app)
				.post('/signup')
				.set('Content-type', 'application/json')
				.send({
					email: 'test1@test.com',
					password: 'password',
					confirm: 'password'
				});
      assert.isTrue(res.body.success);
    });
    it('should succeed with valid email and password for business', async () => {
      const res = await request(app)
				.post('/signup')
				.set('Content-type', 'application/json')
				.send({
					email: 'business@test.com',
					password: 'password',
					confirm: 'password',
					isBusiness: 'on'
				});
      assert.isTrue(res.body.success);
    });
    it('should have kind property equal business', async () => {
      const business = await User.findOne({ 'local.email': 'business@test.com' });
      assert.equal(business.kind, 'Business');
		});
		it('should have holidays set up to false', async () => {
			const business = await User.findOne({ 'local.email': 'business@test.com' });
      assert.isFalse(business.holidays[0].isAvailable);
    });
    after(async () => {
      await User.findOneAndRemove({ 'local.email': 'test@test.com' });
      await User.findOneAndRemove({ 'local.email': 'test1@test.com' });
      await User.findOneAndRemove({ 'local.email': 'business@test.com' });
    });
  });

  describe('GET /forgot', () => {
    it('should have status 200', async () => {
      const res = await request(app)
				.get('/forgot');
      assert.equal(res.statusCode, 200);
    });
  });

  describe('POST /forgot', () => {
    before(async () => {
      await request(app)
				.post('/signup')
				.set('Content-type', 'application/json')
				.send({
					email: process.env.TEST_EMAIL,
					password: 'password',
					confirm: 'password',
				});
    });
    it('should return false if email is invalid', async () => {
      const res = await request(app)
				.post('/forgot')
				.set('Content-type', 'application/json')
				.send({ 
					email: 'test#test.com' 
				});
      assert.isFalse(res.body.success);
    });
    it('should return false if no user found', async () => {
      const res = await request(app)
				.post('/forgot')
				.set('Content-type', 'application/json')
				.send({ email: 'someemail@test.com' });
						assert.isFalse(res.body.success);
					});
    it('should return true if email found', async () => {
      const res = await request(app)
				.post('/forgot')
				.set('Content-type', 'application/json')
      	.send({ 
					email: process.env.TEST_EMAIL 
				});
      assert.isTrue(res.body.success);
    });
    it('should send an error as JSON if an error in User.findOne()', async () => {
      const findOne = sinon.stub(User, 'findOne');
      findOne.throws(new Error('test error'));
      const res = await request(app)
				.post('/forgot')
				.set('Content-type', 'application/json')
      	.send({ 
					email: process.env.TEST_EMAIL 
				});
      findOne.restore();
      assert.isTrue(res.body.error);
    });
    it('should send an error as JSON if an error in User.prototype.save()', async () => {
      const save = sinon.stub(User.prototype, 'save');
      save.throws(new Error('test error'));
      const res = await request(app)
				.post('/forgot')
				.set('Content-type', 'application/json')
				.send({ 
					email: process.env.TEST_EMAIL 
				});
      save.restore();
      assert.isTrue(res.body.error);
    });
    after(async () => {
      await User.findOneAndRemove({ 'local.email': process.env.TEST_EMAIL });
    });
  });

  describe('GET /reset/:token', () => {
    let token;
    before(async () => {
      await request(app)
				.post('/signup')
				.set('Content-type', 'application/json')
				.send({
					email: process.env.TEST_EMAIL,
					password: process.env.TEST_EMAIL_PASS,
					confirm: process.env.TEST_EMAIL_PASS
				});
    });
    before(async () => {
      sinon.spy(crypto, 'randomBytes');
      await request(app)
				.post('/forgot')
				.set('Content-type', 'application/json')
				.send({
					email: process.env.TEST_EMAIL
				});
      const buf = crypto.randomBytes.returnValues[1];
      token =  buf.toString('hex')
      crypto.randomBytes.restore();
    });
    it('should redirect to /forgot if token is invalid', async () => {
      const res = await request(app)
				.get('/reset/incorrecttoken');
      assert.equal(res.header.location, '/forgot');
    });
    it('should redirect to /forgot if token is expired', async () => {
      const clock = sinon.useFakeTimers(Date.now() + (60 * 60 * 1000));
      const res = await request(app)
				.get(`/reset/${token}`);
      clock.restore();
      assert.equal(res.header.location, '/forgot');
    });
    it('should redirect to error page if an error in User.findOne()', async () => {
      const findOne = sinon.stub(User, 'findOne');
      findOne.throws(new Error('test error'));
      const res = await request(app)
				.get(`/reset/${token}`);
      findOne.restore();
      assert.equal(res.header.location, '/error/500');
    });
    it('should redirect to error page if an error in crypto.randomBytes()', async () => {
      const randomBytes = sinon.stub(crypto, 'randomBytes');
      randomBytes.throws(new Error('test error'));
      const res = await request(app)
				.get(`/reset/${token}`);
      randomBytes.restore();
      assert.equal(res.header.location, '/error/500');
    });
    it('should have status 200', async () => {
      const res = await request(app)
				.get(`/reset/${token}`);
      assert.equal(res.statusCode, 200);
    });
    after(async () => {
      await User.findOneAndRemove({ 'local.email': process.env.TEST_EMAIL });
    });
  });

  describe('POST /reset/:token', () => {
    let token;
    before(async () => {
      await request(app)
				.post('/signup')
				.set('Content-type', 'application/json')
				.send({
					email: process.env.TEST_EMAIL,
					password: process.env.TEST_EMAIL_PASS,
					confirm: process.env.TEST_EMAIL_PASS
				});
    });
    before(async () => {
      sinon.spy(crypto, 'randomBytes');
      await request(app)
				.post('/forgot')
				.set('Content-type', 'application/json')
				.send({
					email: process.env.TEST_EMAIL
				});
      const buf = crypto.randomBytes.returnValues[1];
      token =  buf.toString('hex')
      crypto.randomBytes.restore();
    });
    it('should fail if token is incorrect  ', async () => {
      const res = await request(app)
				.post('/reset/incorrecttoken')
				.set('Content-type', 'application/json')
				.send({
					password: 'newPassword',
					confirm: 'newPassword'
				});
      assert.isFalse(res.body.success);
    });
    it('should fail if token is expired', async () => {
      const clock = sinon.useFakeTimers(Date.now() + (60 * 60 * 1000));
      const res = await request(app)
				.post('/reset/invalidtoken')
				.set('Content-type', 'application/json')
				.send({
					password: 'newPassword',
					confirm: 'newPassword'
				});
      clock.restore();
      assert.isFalse(res.body.success);
    });
    it('should send an error as JSON if an error in User.findOne()', async () => {
      const findOne = sinon.stub(User, 'findOne');
      findOne.throws(new Error('test error'));
      const res = await request(app)
				.post(`/reset/${token}`)
				.set('Content-type', 'application/json')
				.send({
					password: 'newPassword',
					confirm: 'newPassword'
				});
      findOne.restore();
      assert.isTrue(res.body.error);
    });
    it('should send an error as JSON if an error in User.prototype.save()', async () => {
      const save = sinon.stub(User.prototype, 'save');
      save.throws(new Error('test error'));
      const res = await request(app)
				.post(`/reset/${token}`)
				.set('Content-type', 'application/json')
				.send({
					password: 'newPassword',
					confirm: 'newPassword'
				});
      save.restore();
      assert.isTrue(res.body.error);
    });
    it('should send an error as JSON if an error in passwordReset.sendConfirmation()', async () => {
      const sendConfirmation = sinon.stub(passwordReset, 'sendConfirmation');
      sendConfirmation.throws(new Error('test error'));
      const res = await request(app)
				.post(`/reset/${token}`)
				.set('Content-type', 'application/json')
				.send({
					password: 'newPassword',
					confirm: 'newPassword'
				});
      sendConfirmation.restore();
      assert.isTrue(res.body.error);
    });
    it('should succeed', async () => {
      const res = await request(app)
				.post(`/reset/${token}`)
				.set('Content-type', 'application/json')
				.send({
					password: 'newPassword',
					confirm: 'newPassword'
				});
      assert.isTrue(res.body.success);
    });
    after(async () => {
      await User.findOneAndRemove({ 'local.email': process.env.TEST_EMAIL });
    });
  });

  describe('GET /home', () => {
    let clientSession;
    let businessSession;
    const testSession1 = session(app);
    const testSession2 = session(app);
    before(async () => {
      await request(app)
				.post('/signup')
				.set('Content-type', 'application/json')
				.send({
					email: 'client@test.com',
					password: 'password',
					confirm: 'password'
				});
      await request(app)
				.post('/signup')
				.set('Content-type', 'application/json')
				.send({
					email: 'business@test.com',
					password: 'password',
					confirm: 'password',
					isBusiness: 'on'
				});
    });
    before(async () => {
      await testSession1
				.post('/login')
				.set('Content-type', 'application/json')
				.send({
					email: 'client@test.com',
					password: 'password'
				});
			clientSession = testSession1;
      await testSession2
				.post('/login')
				.set('Content-type', 'application/json')
				.send({
					email: 'business@test.com',
					password: 'password',
					isBusiness: 'on'
				});
			businessSession = testSession2;
    });
    it('should redirect to / if user in not logged in', async () => {
      const res = await request(app)
				.get('/home');
      assert.equal(res.headers.location, '/');
    });
    it('should redirect to error page if an error in Appointment.find', async () => {
      const find = sinon.stub(Appointment, 'find');
      find.throws(new Error('test error'));
      const res = await clientSession
				.get('/home');
      find.restore();
      assert.equal(res.header.location, '/error/500');
    });
    it('should redirect to error page if an error in User.findById', async () => {
      const findById = sinon.stub(User, 'findById');
      findById.throws(new Error('test error'));
      const res = await clientSession
				.get('/home');
      findById.restore();
      assert.equal(res.header.location, '/error/500');
    });
    it('should get home page', async () => {
      const res = await clientSession
				.get('/home');
      assert.equal(res.headers.view, 'client-home');
    });
    it('should get home page', async () => {
      const res = await businessSession
				.get('/home');
      assert.equal(res.headers.view, 'business-home');
    });
    after(async () => {
      await User.findOneAndRemove({ 'local.email': 'client@test.com' });
      await User.findOneAndRemove({ 'local.email': 'business@test.com' });
    });
  });

  describe('GET /schedule', () => {
    let businessSession;
    let clientSession;
    const testSession1 = session(app);
    const testSession2 = session(app);
    before(async () => {
      await request(app)
				.post('/signup')
				.set('Content-type', 'application/json')
				.send({
					email: 'business@test.com',
					password: 'password',
					confirm: 'password',
					isBusiness: 'on'
				});
      await request(app)
				.post('/signup')
				.set('Content-type', 'application/json')
				.send({
					email: 'client@test.com',
					password: 'password',
					confirm: 'password',
				});
    });
    before(async () => {
      await testSession1
				.post('/login')
				.set('Content-type', 'application/json')
				.send({
					email: 'business@test.com',
					password: 'password'
				});
      businessSession = testSession1;
      await testSession2
				.post('/login')
				.set('Content-type', 'application/json')
				.send({
					email: 'client@test.com',
					password: 'password'
				});
      clientSession = testSession2;
    });
    it('should redirect to / if user is not logged in', async () => {
      const res = await request(app)
				.get('/schedule');
      assert.equal(res.headers.location, '/');
    });
    it('should redirect to / if user is not business', async () => {
      const res = await clientSession
				.get('/schedule');
      assert.equal(res.headers.location, '/');
    });
    it('should get schedule page', async () => {
      const res = await businessSession
				.get('/schedule');
      assert.equal(res.statusCode, 200);
    });
    after(async () => {
      await User.findOneAndRemove({ 'local.email': 'client@test.com' });
      await User.findOneAndRemove({ 'local.email': 'business@test.com' });
    });
  });
    
  describe('POST /schedule/update', () => {
    let businessSession;
    let clientSession;
    const testSession1 = session(app);
    const testSession2 = session(app);
    before(async () => {
      await request(app)
				.post('/signup')
				.set('Content-type', 'application/json')
				.send({
					email: 'business@test.com',
					password: 'password',
					confirm: 'password',
					isBusiness: 'on'
				});
      await request(app)
				.post('/signup')
				.set('Content-type', 'application/json')
				.send({
					email: 'client@test.com',
					password: 'password',
					confirm: 'password',
				});
    });
    before(async () => {
      await testSession1
				.post('/login')
				.set('Content-type', 'application/json')
				.send({
					email: 'business@test.com',
					password: 'password'
				});
      businessSession = testSession1;
      await testSession2
				.post('/login')
				.set('Content-type', 'application/json')
				.send({
					email: 'client@test.com',
					password: 'password'
				});
      clientSession = testSession2;
    });
    it('should have kind property equal business', async () => {
      const business = await User.findOne({ 'local.email': 'business@test.com' });
      assert.equal(business.kind, 'Business');
    });
    it('should fail if user is not logged in', async () => {
      const res = await request(app)
				.post('/schedule/update')
				.set('Content-type', 'application/json')
				.send();
						assert.isFalse(res.body.success);
					});
    it('should fail if user is not business', async () => {
      const res = await clientSession
				.post('/schedule/update')
				.set('Content-type', 'application/json')
				.send({
					days: '',
					time: '',
					holidays: ''
				});
      assert.isFalse(res.body.success);
    });
    it('should fail if no data sent', async () => {
      const res = await businessSession
				.post('/schedule/update')
				.set('Content-type', 'application/json')
				.send({
					days: '',
					time: '',
					holidays: ''
				});
      assert.isFalse(res.body.success);
    });
    it('should send an error as json if an error in Business.findById()', async () => {
      const findById = sinon.stub(Business, 'findById');
      findById.throws(new Error('test error'));
      const res = await businessSession
				.post('/schedule/update')
				.set('Content-type', 'application/json')
				.send({
					days: '',
					time: '',
					holidays: ''
				});
      findById.restore();
      assert.isTrue(res.body.error);
    });
    it('should update business workdays', async () => {
      const res = await businessSession
				.post('/schedule/update')
				.set('Content-type', 'application/json')
				.send({
					days: [{dayNum: '6', isAvailable: true}],
					time: '',
					holidays: ''
				});
      const business = await User.findOne({ 'local.email': 'business@test.com' });
      assert.isTrue(business.workdays[6].isAvailable);
    });
    it('should send success notification', async () => {
      const res = await businessSession
				.post('/schedule/update')
				.set('Content-type', 'application/json')
				.send({
					days: [{dayNum: '6', isAvailable: false}],
					time: '',
					holidays: ''
				});
      assert.isTrue(res.body.success);
    });
    after(async () => {
      await User.findOneAndRemove({ 'local.email': 'client@test.com' });
      await User.findOneAndRemove({ 'local.email': 'business@test.com' });
    });
	});
	
	describe('POST /schedule/suspend', () => {
    let businessSession;
    let clientSession;
    const testSession1 = session(app);
    const testSession2 = session(app);
    before(async () => {
      await request(app)
				.post('/signup')
				.set('Content-type', 'application/json')
				.send({
					email: 'business@test.com',
					password: 'password',
					confirm: 'password',
					isBusiness: 'on'
				});
      await request(app)
				.post('/signup')
				.set('Content-type', 'application/json')
				.send({
					email: 'client@test.com',
					password: 'password',
					confirm: 'password',
				});
    });
    before(async () => {
      await testSession1
				.post('/login')
				.set('Content-type', 'application/json')
				.send({
					email: 'business@test.com',
					password: 'password'
				});
      businessSession = testSession1;
      await testSession2
				.post('/login')
				.set('Content-type', 'application/json')
				.send({
					email: 'client@test.com',
					password: 'password'
				});
      clientSession = testSession2;
    });
    it('should fail if user is not logged in', async () => {
      const res = await request(app)
				.post('/schedule/suspend')
				.set('Content-type', 'application/json')
				.send({
					suspended: true
				});
				assert.isFalse(res.body.success);
		});
    it('should fail if user is not business', async () => {
      const res = await clientSession
				.post('/schedule/suspend')
				.set('Content-type', 'application/json')
				.send({
					suspended: true
				});
      assert.isFalse(res.body.success);
		});
    it('should fail if no data sent', async () => {
      const res = await businessSession
				.post('/schedule/suspend')
				.set('Content-type', 'application/json')
				.send({
				});
      assert.isFalse(res.body.success);
		});
		it('should fail if sent data is not boolean type', async () => {
      const res = await businessSession
				.post('/schedule/suspend')
				.set('Content-type', 'application/json')
				.send({
					suspended: 0
				});
      assert.isFalse(res.body.success);
		});
    it('should send an error as json if an error in Business.findById()', async () => {
      const findById = sinon.stub(Business, 'findById');
      findById.throws(new Error('test error'));
      const res = await businessSession
				.post('/schedule/suspend')
				.set('Content-type', 'application/json')
				.send({
					suspended: true
				});
      findById.restore();
      assert.isTrue(res.body.error);
		});
    it('should suspend business schedule', async () => {
      const res = await businessSession
				.post('/schedule/suspend')
				.set('Content-type', 'application/json')
				.send({
					suspended: true
				});
      const business = await Business.findOne({ 'local.email': 'business@test.com' });
      assert.isTrue(business.suspended);
		});
		it('should suspend business schedule', async () => {
      const res = await businessSession
				.post('/schedule/suspend')
				.set('Content-type', 'application/json')
				.send({
					suspended: false
				});
			const business = await Business.findOne({ 'local.email': 'business@test.com' });
      assert.isFalse(business.suspended);
		});
    it('should send success notification', async () => {
      const res = await businessSession
				.post('/schedule/suspend')
				.set('Content-type', 'application/json')
				.send({
					suspended: true
				});
      assert.isTrue(res.body.success);
		});
    after(async () => {
      await User.findOneAndRemove({ 'local.email': 'client@test.com' });
      await User.findOneAndRemove({ 'local.email': 'business@test.com' });
    });
  });

  describe('GET /profile', () => {
    let clientSession;
    let businessSession;
    const testSession1 = session(app);
    const testSession2 = session(app);
    before(async () => {
      await request(app)
				.post('/signup')
				.set('Content-type', 'application/json')
				.send({
					email: 'client@test.com',
					password: 'password',
					confirm: 'password'
				});
      await request(app)
				.post('/signup')
				.set('Content-type', 'application/json')
				.send({
					email: 'business@test.com',
					password: 'password',
					confirm: 'password',
					isBusiness: 'on'
				});
    });
    before(async () => {
      await testSession1
				.post('/login')
				.set('Content-type', 'application/json')
				.send({
					email: 'client@test.com',
					password: 'password'
				});
			clientSession = testSession1;
      await testSession2
				.post('/login')
				.set('Content-type', 'application/json')
				.send({
					email: 'business@test.com',
					password: 'password',
					isBusiness: 'on'
				});
			businessSession = testSession2;
    });
    it('should redirect to / if user in not logged in', async () => {
      const res = await request(app)
				.get('/profile');
      assert.equal(res.headers.location, '/');
    });
    it('should get profile page if user is client', async () => {
      const res = await clientSession
				.get('/profile');
      assert.equal(res.header.view, 'client-profile');
    });
    it('should get profile page if user is business', async () => {
      const res = await businessSession
				.get('/profile');
      assert.equal(res.header.view, 'business-profile');
    });
    after(async () => {
      await User.findOneAndRemove({ 'local.email': 'client@test.com' });
      await User.findOneAndRemove({ 'local.email': 'business@test.com' });
    });
  });

  describe('POST /profile/update', () => {
    let businessSession;
    let clientSession;
    const testSession1 = session(app);
    const testSession2 = session(app);
    before(async () => {
      await request(app)
				.post('/signup')
				.set('Content-type', 'application/json')
				.send({
					email: 'business@test.com',
					password: 'password',
					confirm: 'password',
					isBusiness: 'on'
				});
      await request(app)
				.post('/signup')
				.set('Content-type', 'application/json')
				.send({
					email: 'client@test.com',
					password: 'password',
					confirm: 'password',
				});
    });
    before(async () => {
      await testSession1
				.post('/login')
				.set('Content-type', 'application/json')
				.send({
					email: 'business@test.com',
					password: 'password'
				})
      businessSession = testSession1;
      await testSession2
				.post('/login')
				.set('Content-type', 'application/json')
				.send({
					email: 'client@test.com',
					password: 'password'
				})
      clientSession = testSession2;
    });
    it('should fail if user is not logged in', async () => {
      const res = await request(app)
				.post('/profile/update')
				.set('Content-type', 'application/json')
				.send({
					firstname: 'foo',
					lastname: 'bar'
				});
      assert.isFalse(res.body.success);
    });
    it('should fail if no data sent', async () => {
      const res = await clientSession
				.post('/profile/update')
				.set('Content-type', 'application/json')
				.send({
					firstname: '',
					lastname: ''
				});
      assert.isFalse(res.body.success);
    });
    it('should send an error as json if an error in User.findById()', async () => {
      const findById = sinon.stub(User, 'findById');
      findById.throws(new Error('test error'));
      const res = await clientSession
				.post('/profile/update')
				.set('Content-type', 'application/json')
				.send({
					firstname: 'foo',
					lastname: 'bar'
				});
      findById.restore();
      assert.isTrue(res.body.error);
    });
    it('should update client profile', async () => {
      const res = await clientSession
				.post('/profile/update')
				.set('Content-type', 'application/json')
				.send({
					firstname: 'foo',
					lastname: 'bar'
				});
      const user = await User.findOne({ 'local.email': 'client@test.com' });
      assert.equal(user.firstname, 'foo');
      assert.equal(user.lastname, 'bar');
    });
    it('should update business profile', async () => {
      const res = await businessSession
				.post('/profile/update')
				.set('Content-type', 'application/json')
				.send({
					firstname: 'foo',
					lastname: 'bar'
				});
      const user = await Business.findOne({ 'local.email': 'business@test.com' });
      assert.equal(user.firstname, 'foo');
      assert.equal(user.lastname, 'bar');
    });
    it('should send success notification', async () => {
      const res = await clientSession
				.post('/profile/update')
				.set('Content-type', 'application/json')
				.send({
					firstname: 'newFirstName',
					lastname: 'newLastName'
				});
      assert.isTrue(res.body.success);
    });
    after(async () => {
      await User.findOneAndRemove({ 'local.email': 'client@test.com' });
      await User.findOneAndRemove({ 'local.email': 'business@test.com' });
    });
	});

	describe('POST /profile/delete', () => {
		let clientSession;
		let businessSession;
		let businessSession1;
		let businessId1;
    const testSession1 = session(app);
		const testSession2 = session(app);
		const testSession3 = session(app);
    before(async () => {
      await request(app)
				.post('/signup')
				.set('Content-type', 'application/json')
				.send({
					email: 'client@test.com',
					password: 'password',
					confirm: 'password'
				});
      await request(app)
				.post('/signup')
				.set('Content-type', 'application/json')
				.send({
					email: 'business@test.com',
					password: 'password',
					confirm: 'password',
					isBusiness: 'on'
				});
				await request(app)
				.post('/signup')
				.set('Content-type', 'application/json')
				.send({
					email: 'business1@test.com',
					password: 'password',
					confirm: 'password',
					isBusiness: 'on'
				});
      const business1 = await Business.findOne({ 'local.email': 'business1@test.com' }, '_id');
      businessId1 = business1._id.toString();
    });
    before(async () => {
      await testSession1
				.post('/login')
				.set('Content-type', 'application/json')
				.send({
					email: 'client@test.com',
					password: 'password'
				})
			clientSession = testSession1;
      await testSession2
				.post('/login')
				.set('Content-type', 'application/json')
				.send({
					email: 'business@test.com',
					password: 'password',
			});
			businessSession = testSession2;
			await testSession3
				.post('/login')
				.set('Content-type', 'application/json')
				.send({
					email: 'business1@test.com',
					password: 'password',
			});
			businessSession1 = testSession3;
    });
    before(async () => {
      await clientSession
				.post('/search/add')
				.set('Content-type', 'application/json')
				.send({
	  			id: businessId1
				});
    });
    before(async () => {
      const date = new Date();
      date.setSeconds(0);
      date.setMilliseconds(0);	
			const business = await Business.findById(businessId1).populate('appointments').exec();
      const monthSchedule = business.createMonth();
      const day = monthSchedule.find(day => day.isAvailable);
      date.setDate(day.num);
			const daySchedule = business.createDay(date);
			const time = daySchedule.find(time => time.isAvailable);
      const hour = (time.time).substring(0, 2);
      const minute = (time.time).substring(3);
      date.setHours(parseInt(hour));
			date.setMinutes(parseInt(minute));
			await clientSession
				.post(`/book/${businessId1}/book`)
				.set('Content-type', 'application/json')
				.send({
					date: date.toISOString(),
					reason: 'reason'
				});
		});
    it('should fail if user is not logged in', async () => {
      const res = await request(app)
				.post('/profile/delete')
				.set('Content-type', 'application/json')
				.send({
					password: 'password',
				});
      assert.isFalse(res.body.success);
		});
    it('should fail if no password sent', async () => {
      const res = await clientSession
				.post('/profile/delete')
				.set('Content-type', 'application/json')
				.send({
				});
      assert.isFalse(res.body.success);
		});
		it('should fail if password is incorrent', async () => {
      const res = await clientSession
				.post('/profile/delete')
				.set('Content-type', 'application/json')
				.send({
					password: 'incorrectPassword'
				});
      assert.isFalse(res.body.success);
		});
    it('should send an error as json if an error in User.findById()', async () => {
      const findById = sinon.stub(User, 'findById');
      findById.throws(new Error('test error'));
      const res = await clientSession
				.post('/profile/delete')
				.set('Content-type', 'application/json')
				.send({
					password: 'password'
				});
      findById.restore();
      assert.isTrue(res.body.error);
		});
    it('should delete client account', async () => {
      const res = await clientSession
				.post('/profile/delete')
				.set('Content-type', 'application/json')
				.send({
					password: 'password'
				});
			const user = await User.findOne({ 'local.email': 'client@test.com' });
      assert.isNull(user);
		});
		it('should cancel business appointments', async () => {
      const res = await businessSession1
				.post('/profile/delete')
				.set('Content-type', 'application/json')
				.send({
					password: 'password'
				});
			const appointment = await Appointment.findOne({ 'business': businessId1 });
      assert.isTrue(appointment.canceled);
		});
		it('should fail to get home page for clients', async () => {
			const res = await clientSession
				.get('/home');
      assert.notEqual(res.statusCode, 200);
		});
    it('should send success notification', async () => {
      const res = await businessSession
				.post('/profile/delete')
				.set('Content-type', 'application/json')
				.send({
					password: 'password'
				});
      assert.isTrue(res.body.success);
		});
    after(async () => {
      await User.findOneAndRemove({ 'local.email': 'client@test.com' });
			await User.findOneAndRemove({ 'local.email': 'business@test.com' });
			await User.findOneAndRemove({ 'local.email': 'business1@test.com' });
			await Appointment.findOneAndRemove({ 'business': businessId1 });
    });
	});
	
  describe('GET /search', () => {
    let clientSession;
    let businessSession;
    const testSession1 = session(app);
    const testSession2 = session(app);
    before(async () => {
      await request(app)
				.post('/signup')
				.set('Content-type', 'application/json')
				.send({
					email: 'client@test.com',
					password: 'password',
					confirm: 'password'
				});
      await request(app)
				.post('/signup')
				.set('Content-type', 'application/json')
				.send({
					email: 'business@test.com',
					password: 'password',
					confirm: 'password',
					isBusiness: 'on'
				});
    });
    before(async () => {
      await testSession1
				.post('/login')
				.set('Content-type', 'application/json')
				.send({
					email: 'client@test.com',
					password: 'password'
				})
			clientSession = testSession1;
      await testSession2
				.post('/login')
				.set('Content-type', 'application/json')
				.send({
					email: 'business@test.com',
					password: 'password',
					isBusiness: 'on'
				})
			businessSession = testSession2;
    });
    it('should redirect to / if user in not logged in', async () => {
      const res = await request(app)
				.get('/search');
      assert.equal(res.headers.location, '/');
    });
    it('should redirect to / if user is business', async () => {
      const res = await businessSession
				.get('/search');
      assert.equal(res.headers.location, '/');
    });
    it('should get the page if user is client', async () => {
      const res = await clientSession
				.get('/search');
      assert.equal(res.statusCode, 200);
    });
    after(async () => {
      await User.findOneAndRemove({ 'local.email': 'client@test.com' });
      await User.findOneAndRemove({ 'local.email': 'business@test.com' });
    });
  });

  describe('POST /search/:pattern', () => {
    let clientSession;
    let businessSession;
    const testSession1 = session(app);
    const testSession2 = session(app);
    before(async () => {
      await request(app)
				.post('/signup')
				.set('Content-type', 'application/json')
				.send({
					email: 'client@test.com',
					password: 'password',
					confirm: 'password'
				});
      await request(app)
				.post('/signup')
				.set('Content-type', 'application/json')
				.send({
					email: 'business@test.com',
					password: 'password',
					confirm: 'password',
					isBusiness: 'on'
				});
    });
    before(async () => {
      await testSession1
				.post('/login')
				.set('Content-type', 'application/json')
				.send({
					email: 'client@test.com',
					password: 'password'
				});
			clientSession = testSession1;
      await testSession2
				.post('/login')
				.set('Content-type', 'application/json')
				.send({
					email: 'business@test.com',
					password: 'password',
					isBusiness: 'on'
				})
			businessSession = testSession2;
    });
    it('should fail if user in not logged in', async () => {
      const res = await request(app)
				.post('/search')
				.set('Content-type', 'application/json')
				.send({
					pattern: 'b',
				});
      assert.isFalse(res.body.success);
    });
    it('should fail  if user is business', async () => {
      const res = await businessSession
				.post('/search')
				.set('Content-type', 'application/json')
				.send({
					pattern: 'b',
				});
      assert.isFalse(res.body.success);
    });
    it('should send an error as json if an error in Business.find()', async () => {
      const find = sinon.stub(Business, 'find');
      find.throws(new Error('test error'));
      const res = await clientSession
				.post('/search')
				.set('Content-type', 'application/json')
				.send({
					pattern: 'b',
				});
      find.restore();
      assert.isTrue(res.body.error);
    });
    it('should get matching businesses', async () => {
      const res = await clientSession
				.post('/search')
				.set('Content-type', 'application/json')
				.send({
					pattern: 'b',
				});
      assert.equal(res.body.results[0].local.email, 'business@test.com');
    });
    after(async () => {
      await User.findOneAndRemove({ 'local.email': 'client@test.com' });
      await User.findOneAndRemove({ 'local.email': 'business@test.com' });
    });
  });

  describe('POST /search/add', () => {
    let clientSession;
    let businessSession;
    let businessId;
    let businessId1;
    const testSession1 = session(app);
    const testSession2 = session(app);
    before(async () => {
      await request(app)
				.post('/signup')
				.set('Content-type', 'application/json')
				.send({
					email: 'client@test.com',
					password: 'password',
					confirm: 'password'
				});
      await request(app)
				.post('/signup')
				.set('Content-type', 'application/json')
				.send({
					email: 'business@test.com',
					password: 'password',
					confirm: 'password',
					isBusiness: 'on'
				});
      const business = await Business.findOne({ 'local.email': 'business@test.com' }, '_id');
      businessId = business._id.toString().toString();
      await request(app)
				.post('/signup')
				.set('Content-type', 'application/json')
				.send({
					email: 'business1@test.com',
					password: 'password',
					confirm: 'password',
					isBusiness: 'on'
				});
      const business1 = await Business.findOne({ 'local.email': 'business1@test.com' }, '_id');
      businessId1 = business1._id.toString();
    });
    before(async () => {
      await testSession1
				.post('/login')
				.set('Content-type', 'application/json')
				.send({
					email: 'client@test.com',
					password: 'password'
				});
			clientSession = testSession1;
      await testSession2
				.post('/login')
				.set('Content-type', 'application/json')
				.send({
					email: 'business@test.com',
					password: 'password',
					isBusiness: 'on'
				});
			businessSession = testSession2;
    });
    it('should fail if user in not logged in', async () => {
      const res = await request(app)
				.post('/search/add')
				.set('Content-type', 'application/json')
				.send({
					id: businessId
				});
      assert.isFalse(res.body.success);
    });
    it('should fail if user is not client', async () => {
      const res = await businessSession
				.post('/search/add')
				.set('Content-type', 'application/json')
				.send({
					id: businessId
				});
      assert.isFalse(res.body.success);
    });
    it('should send an error as json if an error in User.findById()', async () => {
      const findById = sinon.stub(User, 'findById');
      findById.throws(new Error('test error'));
      const res = await clientSession
				.post('/search/add')
				.set('Content-type', 'application/json')
				.send({
					id: businessId
				});
      findById.restore();
      assert.isTrue(res.body.error);
    });
    it('should fail if no id sent', async () => {
      const res = await clientSession
				.post('/search/add')
				.set('Content-type', 'application/json')
				.send({
					id: ''
				});
      assert.isFalse(res.body.success);
    });
    it('should fail if sent data is not mongoose id', async () => {
      const res = await clientSession
				.post('/search/add')
				.set('Content-type', 'application/json')
				.send({
					id: 'eqr1234;'
				});
      assert.isFalse(res.body.success);
    });
    it('should add business to client contact list', async () => {
      const res = await clientSession
				.post('/search/add')
				.set('Content-type', 'application/json')
				.send({
					id: businessId
				});
      const user = await User.findOne({ 'local.email': 'client@test.com' }, 'contacts');
      assert.equal(user.contacts[0].toString(), businessId);
    });
    it('should send success notification', async () => {
      const res = await clientSession
				.post('/search/add')
				.set('Content-type', 'application/json')
				.send({
					id: businessId1
				});
      assert.isTrue(res.body.success);
    });
    it('should fail if business is already in contact list', async () => {
      const res = await clientSession
				.post('/search/add')
				.set('Content-type', 'application/json')
				.send({
					id: businessId
				});
      assert.isFalse(res.body.success);
    });
    after(async () => {
      await User.findOneAndRemove({ 'local.email': 'client@test.com' });
      await User.findOneAndRemove({ 'local.email': 'business@test.com' });
      await User.findOneAndRemove({ 'local.email': 'business1@test.com' });
    });
  });

  describe('POST /search/remove', () => {
    let clientSession;
    let businessSession;
    let businessId;
    let businessId1;
    const testSession1 = session(app);
    const testSession2 = session(app);
    before(async () => {
      await request(app)
				.post('/signup')
				.set('Content-type', 'application/json')
				.send({
					email: 'client@test.com',
					password: 'password',
					confirm: 'password'
				});
      await request(app)
				.post('/signup')
				.set('Content-type', 'application/json')
				.send({
					email: 'business@test.com',
					password: 'password',
					confirm: 'password',
					isBusiness: 'on'
				});
      const business = await Business.findOne({ 'local.email': 'business@test.com' }, '_id');
      businessId = business._id.toString();
      await request(app)
				.post('/signup')
				.set('Content-type', 'application/json')
				.send({
					email: 'business1@test.com',
					password: 'password',
					confirm: 'password',
					isBusiness: 'on'
				});
      const business1 = await Business.findOne({ 'local.email': 'business1@test.com' }, '_id');
      businessId1 = business1._id.toString();
    });
    before(async () => {
      await testSession1
				.post('/login')
				.set('Content-type', 'application/json')
				.send({
					email: 'client@test.com',
					password: 'password'
				});
			clientSession = testSession1;
      await testSession2
				.post('/login')
				.set('Content-type', 'application/json')
				.send({
					email: 'business@test.com',
					password: 'password',
					isBusiness: 'on'
				});
	businessSession = testSession2;
    });
    before(async () => {
      await clientSession
			.post('/search/add')
			.set('Content-type', 'application/json')
			.send({
				id: businessId
			});
      await clientSession
				.post('/search/add')
				.set('Content-type', 'application/json')
				.send({
					id: businessId1
				});
    });
    it('should fail if user in not logged in', async () => {
      const res = await request(app)
				.post('/search/remove')
				.set('Content-type', 'application/json')
				.send({
					id: businessId
				});
      assert.isFalse(res.body.success);
    });
    it('should fail if user is not client', async () => {
      const res = await businessSession
				.post('/search/remove')
				.set('Content-type', 'application/json')
				.send({
					id: businessId
				});
      assert.isFalse(res.body.success);
    });
    it('should send an error as json if an error in User.findById()', async () => {
      const findById = sinon.stub(User, 'findById');
      findById.throws(new Error('test error'));
      const res = await clientSession
				.post('/search/remove')
				.set('Content-type', 'application/json')
				.send({
					id: businessId
				});
      findById.restore();
      assert.isTrue(res.body.error);
    });
    it('should fail if no id sent', async () => {
      const res = await clientSession
				.post('/search/remove')
				.set('Content-type', 'application/json')
				.send({
					id: ''
				});
      assert.isFalse(res.body.success);
    });
    it('should remove business from  client contact list', async () => {
      const res = await clientSession
				.post('/search/remove')
				.set('Content-type', 'application/json')
				.send({
					id: businessId
				});
      const user = await User.findOne({ 'local.email': 'client@test.com' }, 'contacts');
      const contacts = user.contacts.map(id => id.toString());
      assert.isFalse(contacts.includes(businessId));
    });
    it('should send success notification', async () => {
      const res = await clientSession
				.post('/search/remove')
				.set('Content-type', 'application/json')
				.send({
					id: businessId1
				});
      assert.isTrue(res.body.success);
    });
    it('should fail if business is not in contact list', async () => {
      const res = await clientSession
				.post('/search/remove')
				.set('Content-type', 'application/json')
				.send({
					id: businessId
				});
      assert.isFalse(res.body.success);
    });
    after(async () => {
      await User.findOneAndRemove({ 'local.email': 'client@test.com' });
      await User.findOneAndRemove({ 'local.email': 'business@test.com' });
      await User.findOneAndRemove({ 'local.email': 'business1@test.com' });
    });
	});

	describe('GET /contacts', () => {
    let clientSession;
    let businessSession;
    const testSession1 = session(app);
    const testSession2 = session(app);
    before(async () => {
      await request(app)
				.post('/signup')
				.set('Content-type', 'application/json')
				.send({
					email: 'client@test.com',
					password: 'password',
					confirm: 'password'
				});
      await request(app)
				.post('/signup')
				.set('Content-type', 'application/json')
				.send({
					email: 'business@test.com',
					password: 'password',
					confirm: 'password',
					isBusiness: 'on'
				});
    });
    before(async () => {
      await testSession1
				.post('/login')
				.set('Content-type', 'application/json')
				.send({
					email: 'client@test.com',
					password: 'password'
				});
			clientSession = testSession1;
      await testSession2
				.post('/login')
				.set('Content-type', 'application/json')
				.send({
					email: 'business@test.com',
					password: 'password',
					isBusiness: 'on'
				});
			businessSession = testSession2;
    });
    it('should redirect to / if user in not logged in', async () => {
      const res = await request(app)
				.get('/contacts');
      assert.equal(res.headers.location, '/');
		});
		it('hould redirect to / if user in not client', async () => {
      const res = await businessSession
				.get('/contacts');
			assert.equal(res.headers.location, '/');
		});
		it('should redirect to error page if an error in User.findById()', async () => {
      const findById = sinon.stub(User, 'findById');
      findById.throws(new Error('test error'));
			const res = await clientSession
				.get('/contacts');
      findById.restore();
      assert.equal(res.headers.location, '/error/500');
    });
    it('should get contact page if user is client', async () => {
      const res = await clientSession
				.get('/contacts');
      assert.equal(res.statusCode, 200);
    });
    after(async () => {
      await User.findOneAndRemove({ 'local.email': 'client@test.com' });
      await User.findOneAndRemove({ 'local.email': 'business@test.com' });
    });
  });

  describe('GET /book/nocontacts', () => {
    let clientSession;
    let businessSession;
    const testSession1 = session(app);
    const testSession2 = session(app);
    before(async () => {
      await request(app)
				.post('/signup')
				.set('Content-type', 'application/json')
				.send({
					email: 'client@test.com',
					password: 'password',
					confirm: 'password'
				});
      await request(app)
				.post('/signup')
				.set('Content-type', 'application/json')
				.send({
					email: 'business@test.com',
					password: 'password',
					confirm: 'password',
					isBusiness: 'on'
				});
    });
    before(async () => {
      await testSession1
				.post('/login')
				.set('Content-type', 'application/json')
				.send({
					email: 'client@test.com',
					password: 'password'
				});
			clientSession = testSession1;
      await testSession2
				.post('/login')
				.set('Content-type', 'application/json')
				.send({
					email: 'business@test.com',
					password: 'password',
					isBusiness: 'on'
				});
			businessSession = testSession2;
    });
    it('should redirect to / if user in not logged in', async () => {
      const res = await request(app)
				.get('/book/nocontacts');
      assert.equal(res.headers.location, '/');
    });
    it('should redirect to / if user is not client', async () => {
      const res = await businessSession
				.get('/book/nocontacts');
      assert.equal(res.headers.location, '/');
    });
    it('should get the page if user is client', async () => {
      const res = await clientSession
				.get('/book/nocontacts');
      assert.equal(res.statusCode, 200);
    });
    after(async () => {
      await User.findOneAndRemove({ 'local.email': 'client@test.com' });
      await User.findOneAndRemove({ 'local.email': 'business@test.com' });
    });
  });

  describe('GET /book/:id', () => {
    let clientSession;
    let businessSession;
    let businessId;
    const testSession1 = session(app);
    const testSession2 = session(app);
    before(async () => {
      await request(app)
				.post('/signup')
				.set('Content-type', 'application/json')
				.send({
					email: 'client@test.com',
					password: 'password',
					confirm: 'password'
				});
      await request(app)
				.post('/signup')
				.set('Content-type', 'application/json')
				.send({
					email: 'business@test.com',
					password: 'password',
					confirm: 'password',
					isBusiness: 'on'
				});
      const business = await Business.findOne({ 'local.email': 'business@test.com' }, '_id');
      businessId = business._id.toString();
    });
    before(async () => {
      await testSession1
				.post('/login')
				.set('Content-type', 'application/json')
				.send({
					email: 'client@test.com',
					password: 'password'
				});
			clientSession = testSession1;
      await testSession2
				.post('/login')
				.set('Content-type', 'application/json')
				.send({
					email: 'business@test.com',
					password: 'password',
					isBusiness: 'on'
				});
			businessSession = testSession2;
    });
    before(async () => {
      await clientSession
				.post('/search/add')
				.set('Content-type', 'application/json')
				.send({
					id: businessId
				});
    });
    it('should redirect to / if user in not logged in', async () => {
      const res = await request(app)
				.get(`/book/${businessId}`);
      assert.equal(res.headers.location, '/');
    });
    it('should redirect to / if user is not client', async () => {
      const res = await businessSession
				.get(`/book/${businessId}`);
      assert.equal(res.headers.location, '/');
    });
    it('should redirect to error page if business id is not valid', async () => {
      const res = await clientSession
				.get('/book/{"$gt":""}');
      assert.equal(res.headers.location, '/error/404');
    });
    it('should redirect to error page if an error in User.findById()', async () => {
      const findById = sinon.stub(User, 'findById');
      findById.throws(new Error('test error'));
      const res = await clientSession
				.get(`/book/${businessId}`);
      findById.restore();
      assert.equal(res.headers.location, '/error/500');
    });
    it('should get booking page', async () => {
      const res = await clientSession
				.get(`/book/${businessId}`);
      assert.equal(res.statusCode, 200);
    });
    after(async () => {
      await User.findOneAndRemove({ 'local.email': 'client@test.com' });
      await User.findOneAndRemove({ 'local.email': 'business@test.com' });
    });
  });

  describe('POST /book/:id/month', () => {
    let clientSession;
    let businessSession;
    let businessId;
    let date;
    const testSession1 = session(app);
    const testSession2 = session(app);
    before(async () => {
      await request(app)
				.post('/signup')
				.set('Content-type', 'application/json')
				.send({
					email: 'client@test.com',
					password: 'password',
					confirm: 'password'
				});
      await request(app)
				.post('/signup')
				.set('Content-type', 'application/json')
				.send({
					email: 'business@test.com',
					password: 'password',
					confirm: 'password',
					isBusiness: 'on'
				});
      const business = await Business.findOne({ 'local.email': 'business@test.com' }, '_id');
      businessId = business._id.toString();
    });
    before(async () => {
      await testSession1
				.post('/login')
				.set('Content-type', 'application/json')
				.send({
					email: 'client@test.com',
					password: 'password'
				})
			clientSession = testSession1;
      await testSession2
				.post('/login')
				.set('Content-type', 'application/json')
				.send({
					email: 'business@test.com',
					password: 'password',
					isBusiness: 'on'
				})
			businessSession = testSession2;
    });
    before(async () => {
      await clientSession
				.post('/search/add')
				.set('Content-type', 'application/json')
				.send({
					id: businessId
				});
    });
    before(async () => {
      date = new Date();
      date.setSeconds(0);
      date.setMilliseconds(0);
    });
    it('should fail if user is not logged in', async () => {
      const res = await request(app)
				.post(`/book/${businessId}/month`)
				.set('Content-type', 'application/json')
				.send({
					dateISO: date.toISOString(),
					month: 'next'
				});
      assert.isFalse(res.body.success);
    });
    it('should redirect to / if user is not client', async () => {
      const res = await businessSession
				.post(`/book/${businessId}/month`)
				.set('Content-type', 'application/json')
				.send({
					dateISO: date.toISOString(),
					month: 'next'
				});
      assert.isFalse(res.body.success);
    });
    it('should send an error as json if an error in Business.findById()', async () => {
      const findById = sinon.stub(Business, 'findById');
      findById.throws(new Error('test error'));
      const res = await clientSession
				.post(`/book/${businessId}/month`)
				.set('Content-type', 'application/json')
				.send({
					dateISO: date.toISOString(),
					month: 'next'
				});
      findById.restore();
      assert.isTrue(res.body.error);
    });
    it('should fail if sent data is not mongoose id', async () => {
      const res = await clientSession
				.post('/book/incorrectid/month')
				.set('Content-type', 'application/json')
				.send({
					dateISO: date.toISOString(),
					month: 'next'
				});
      assert.isFalse(res.body.success);
    });
    it('should send next month schedule', async () => {
      const res = await clientSession
				.post(`/book/${businessId}/month`)
				.set('Content-type', 'application/json')
				.send({
					dateISO: date.toISOString(),
					month: 'next'
				});
      assert.isArray(res.body.days);
      assert.isTrue(res.body.days.length > 0);
      assert.property(res.body.days[0], 'num');
      assert.property(res.body.days[0], 'isAvailable');
    });
    it('should not send prev month schedule', async () => {
      const res = await clientSession
				.post(`/book/${businessId}/month`)
				.set('Content-type', 'application/json')
				.send({
					dateISO: date.toISOString(),
					month: 'prev'
				});
      assert.isArray(res.body.days);
      assert.isTrue(res.body.days.length > 0);
      assert.property(res.body.days[0], 'num');
      assert.property(res.body.days[0], 'isAvailable');
      assert.equal(new Date(res.body.dateISO).getMonth(), date.getMonth());
    });
    it('should send prev month schedule', async () => {
      date.setMonth(date.getMonth() + 1);
      const res = await clientSession
				.post(`/book/${businessId}/month`)
				.set('Content-type', 'application/json')
				.send({
					dateISO: date.toISOString(),
					month: 'prev'
				});
      date.setMonth(date.getMonth() - 1);
      assert.isArray(res.body.days);
      assert.isTrue(res.body.days.length > 0);
      assert.property(res.body.days[0], 'num');
      assert.property(res.body.days[0], 'isAvailable');
      assert.equal(new Date(res.body.dateISO).getMonth(), date.getMonth());
    });
    it('should send schedule of January of the next year', async () => {
      date.setMonth(11);
      const res = await clientSession
				.post(`/book/${businessId}/month`)
				.set('Content-type', 'application/json')
				.send({
					dateISO: date.toISOString(),
					month: 'next'
				});
      date.setMonth(new Date().getMonth());
      assert.isArray(res.body.days);
      assert.isTrue(res.body.days.length > 0);
      assert.property(res.body.days[0], 'num');
      assert.property(res.body.days[0], 'isAvailable');
      assert.equal(new Date(res.body.dateISO).getMonth(), 0);
      assert.equal(new Date(res.body.dateISO).getFullYear(), date.getFullYear() + 1);
    });
    it('should send schedule of December of the prev year', async () => {
      date.setMonth(0);
      date.setFullYear(new Date().getFullYear() + 1);
      const res = await clientSession
				.post(`/book/${businessId}/month`)
				.set('Content-type', 'application/json')
				.send({
					dateISO: date.toISOString(),
					month: 'prev'
				});
      date.setMonth(new Date().getMonth());
      date.setFullYear(new Date().getFullYear());
      assert.isArray(res.body.days);
      assert.isTrue(res.body.days.length > 0);
      assert.property(res.body.days[0], 'num');
      assert.property(res.body.days[0], 'isAvailable');
      assert.equal(new Date(res.body.dateISO).getMonth(), 11);
      assert.equal(new Date(res.body.dateISO).getFullYear(), date.getFullYear());
    });
    it('should send success notification', async () => {
      const res = await clientSession
				.post(`/book/${businessId}/month`)
				.set('Content-type', 'application/json')
				.send({
					dateISO: date.toISOString(),
					month: 'next'
				});
      assert.isTrue(res.body.success);
    });
    after(async () => {
      await User.findOneAndRemove({ 'local.email': 'client@test.com' });
      await User.findOneAndRemove({ 'local.email': 'business@test.com' });
    });
  });

  describe('POST /book/:id/day', () => {
    let clientSession;
    let businessSession;
    let businessId;
    let date;
    let dayNum;
    const testSession1 = session(app);
    const testSession2 = session(app);
    before(async () => {
      await request(app)
				.post('/signup')
				.set('Content-type', 'application/json')
				.send({
					email: 'client@test.com',
					password: 'password',
					confirm: 'password'
				});
      await request(app)
        .post('/signup')
				.set('Content-type', 'application/json')
				.send({
					email: 'business@test.com',
					password: 'password',
					confirm: 'password',
					isBusiness: 'on'
				});
      const business = await Business.findOne({ 'local.email': 'business@test.com' }, '_id');
      businessId = business._id.toString();
    });
    before(async () => {
      await testSession1
				.post('/login')
				.set('Content-type', 'application/json')
				.send({
					email: 'client@test.com',
					password: 'password'
				})
	clientSession = testSession1;
      await testSession2
				.post('/login')
				.set('Content-type', 'application/json')
				.send({
					email: 'business@test.com',
					password: 'password',
					isBusiness: 'on'
				})
	businessSession = testSession2;
    });
    before(async () => {
      await clientSession
				.post('/search/add')
				.set('Content-type', 'application/json')
				.send({
					id: businessId
				});
    });
    before(async () => {
      date = new Date();
      date.setSeconds(0);
      date.setMilliseconds(0);
      const business = await Business.findById(businessId);
      const monthSchedule = business.createMonth();
      const day = monthSchedule.find(day => day.isAvailable);
      dayNum = day.num;
    });
    it('should fail if user is not logged in', async () => {
      const res = await request(app)
				.post(`/book/${businessId}/day`)
				.set('Content-type', 'application/json')
				.send({
					dateISO: date.toISOString(),
					day: dayNum
				});
      assert.isFalse(res.body.success);
    });
    it('should redirect to / if user is not client', async () => {
      const res = await businessSession
				.post(`/book/${businessId}/day`)
				.set('Content-type', 'application/json')
				.send({
					dateISO: date.toISOString(),
					day: dayNum
				});
      assert.isFalse(res.body.success);
    });
    it('should send an error as json if an error in Business.findById()', async () => {
      const findById = sinon.stub(Business, 'findById');
      findById.throws(new Error('test error'));
      const res = await clientSession
				.post(`/book/${businessId}/day`)
				.set('Content-type', 'application/json')
				.send({
					dateISO: date.toISOString(),
					day: dayNum
				});
      findById.restore();
      assert.isTrue(res.body.error);
    });
    it('should fail if business id is not valid', async () => {
      const res = await clientSession
				.post('/book/incorrectid/day')
				.set('Content-type', 'application/json')
				.send({
					dateISO: date.toISOString(),
					day: dayNum
				});
      assert.isFalse(res.body.success);
    });
    it('should send business schedule for a chosen day', async () => {
      const res = await clientSession
				.post(`/book/${businessId}/day`)
				.set('Content-type', 'application/json')
				.send({
					dateISO: date.toISOString(),
					day: dayNum
				});
      assert.isArray(res.body.hours);
      assert.isTrue(res.body.hours.length > 0);
      assert.property(res.body.hours[0], 'time');
      assert.property(res.body.hours[0], 'isAvailable');
    });
    it('should send success notification', async () => {
      const res = await clientSession
				.post(`/book/${businessId}/day`)
				.set('Content-type', 'application/json')
				.send({
					dateISO: date.toISOString(),
					day: dayNum
				});
      assert.isTrue(res.body.success);
    });
    after(async () => {
      await User.findOneAndRemove({ 'local.email': 'client@test.com' });
      await User.findOneAndRemove({ 'local.email': 'business@test.com' });
    });
  });

  describe('POST /book/:id/book', () => {
    let clientSession;
    let businessSession;
    let businessId;
		let date;
		let notWorkdayDate;
		let passedTimeDate;
    const testSession1 = session(app);
    const testSession2 = session(app);
    before(async () => {
      await request(app)
				.post('/signup')
				.set('Content-type', 'application/json')
				.send({
	  email: 'client@test.com',
	  password: 'password',
	  confirm: 'password'
	});
      await request(app)
				.post('/signup')
				.set('Content-type', 'application/json')
				.send({
	  email: 'business@test.com',
	  password: 'password',
	  confirm: 'password',
	  isBusiness: 'on'
	});
      const business = await Business.findOne({ 'local.email': 'business@test.com' }, '_id');
      businessId = business._id.toString().toString();
    });
    before(async () => {
      await testSession1
				.post('/login')
				.set('Content-type', 'application/json')
				.send({
	  email: 'client@test.com',
	  password: 'password'
	})
	clientSession = testSession1;
      await testSession2
				.post('/login')
				.set('Content-type', 'application/json')
				.send({
	  email: 'business@test.com',
	  password: 'password',
	  isBusiness: 'on'
	})
	businessSession = testSession2;
    });
    before(async () => {
      await clientSession
				.post('/search/add')
				.set('Content-type', 'application/json')
				.send({
	  			id: businessId
				});
    });
    before(async () => {
      date = new Date();
      date.setSeconds(0);
      date.setMilliseconds(0);
      const business = await Business.findById(businessId);
      const monthSchedule = business.createMonth();
      const day = monthSchedule.find(day => day.isAvailable);
      date.setDate(day.num);
      const daySchedule = business.createDay(date);
      const time = daySchedule.find(time => time.isAvailable);
      const hour = (time.time).substring(0, 2);
      const minute = (time.time).substring(3);
      date.setHours(parseInt(hour));
			date.setMinutes(parseInt(minute));

			notWorkdayDate = new Date(date.getTime());
			const notWorkday = monthSchedule.find(day => !day.isAvailable && parseInt(day.num) > date.getDate());
			notWorkdayDate.setDate(notWorkday.num);

			passedTimeDate = new Date(date.getTime());
			const passedTime = daySchedule.find(time => !time.isAvailable);
			const passedHour = (passedTime.time).substring(0, 2);
      const PassedMinutes = (passedTime.time).substring(3);
      passedTimeDate.setHours(parseInt(passedHour));
			passedTimeDate.setMinutes(parseInt(PassedMinutes));
		});
    it('should get an error if user is not logged in', async () => {
      const res = await request(app)
				.post(`/book/${businessId}/book`)
				.set('Content-type', 'application/json')
				.send({
					date: date.toISOString(),
				});
      assert.isFalse(res.body.success);
    });
    it('should redirect to / if user is not client', async () => {
      const res = await businessSession
				.post(`/book/${businessId}/book`)
				.set('Content-type', 'application/json')
				.send({
					date: date.toISOString(),
				});
      assert.isFalse(res.body.success);
    });
    it('should send an error as json if an error in Business.findById()', async () => {
      const findById = sinon.stub(Business, 'findById');
      findById.throws(new Error('test error'));
      const res = await clientSession
				.post(`/book/${businessId}/book`)
				.set('Content-type', 'application/json')
				.send({
					date: date.toISOString(),
				});
      findById.restore();
      assert.isTrue(res.body.error);
    });
    it('should fail if business id is not valid', async () => {
      const res = await clientSession
				.post('/book/incorrectid/book')
				.set('Content-type', 'application/json')
				.send({
					date: date.toISOString(),
				});
      assert.isFalse(res.body.success);
    });
    it('should create an apoointment', async () => {
      const res = await clientSession
				.post(`/book/${businessId}/book`)
				.set('Content-type', 'application/json')
				.send({
					date: date.toISOString(),
					reason: 'reason'
				});
			const appointment = await Appointment.findOne({ 'business': businessId });
			assert.equal(appointment.reason, 'reason');
			assert.isFalse(appointment.canceled);
      assert.property(appointment, 'user');
			assert.property(appointment, 'business');
			assert.property(appointment, 'date');
			assert.property(appointment, 'reason');
			assert.property(appointment, 'canceled');
		});
		it('should fail if time already booked', async () => {
      const res = await clientSession
				.post(`/book/${businessId}/book`)
				.set('Content-type', 'application/json')
				.send({
					date: date.toISOString(),
					reason: 'reason'
				});
			assert.isFalse(res.body.success);
		});
		it('should fail if appointment time is not in business workdays', async () => {
      const res = await clientSession
				.post(`/book/${businessId}/book`)
				.set('Content-type', 'application/json')
				.send({
					date: notWorkdayDate.toISOString(),
					reason: 'reason'
				});
			assert.isFalse(res.body.success);
		});
		it('should fail if appointment time is passed', async () => {
      const res = await clientSession
				.post(`/book/${businessId}/book`)
				.set('Content-type', 'application/json')
				.send({
					date: passedTimeDate.toISOString(),
					reason: 'reason'
				});
			assert.isFalse(res.body.success);
		});
		it('should bound appointment to business', async () => {
			const business = await Business.findOne({ 'local.email': 'business@test.com'});
			assert.equal(business.appointments.length, 1);
		});
		it('should bound appointment to client', async () => {
			const client = await User.findOne({ 'local.email': 'client@test.com'});
			assert.equal(client.appointments.length, 1);
    });
    it('should send success notification', async () => {
			await Appointment.deleteMany({});
      const res = await clientSession
				.post(`/book/${businessId}/book`)
				.set('Content-type', 'application/json')
				.send({
					date: date.toISOString(),
					reason: 'reason'
				});
      assert.isTrue(res.body.success);
    });
    after(async () => {
      await User.findOneAndRemove({ 'local.email': 'client@test.com' });
			await User.findOneAndRemove({ 'local.email': 'business@test.com' });
			await Appointment.deleteMany({});
    });
	});

	describe('POST /home/cancel', () => {
    let clientSession;
    let businessSession;
		let businessId;
		let appointmentId;
		let appointmentId1;
    const testSession1 = session(app);
    const testSession2 = session(app);
    before(async () => {
      await request(app)
				.post('/signup')
				.set('Content-type', 'application/json')
				.send({
	  email: 'client@test.com',
	  password: 'password',
	  confirm: 'password'
	});
      await request(app)
				.post('/signup')
				.set('Content-type', 'application/json')
				.send({
	  email: 'business@test.com',
	  password: 'password',
	  confirm: 'password',
	  isBusiness: 'on'
	});
      const business = await Business.findOne({ 'local.email': 'business@test.com' }, '_id');
      businessId = business._id.toString();
    });
    before(async () => {
      await testSession1
				.post('/login')
				.set('Content-type', 'application/json')
				.send({
					email: 'client@test.com',
					password: 'password'
				})
			clientSession = testSession1;
      await testSession2
				.post('/login')
				.set('Content-type', 'application/json')
				.send({
					email: 'business@test.com',
					password: 'password',
					isBusiness: 'on'
			});
			businessSession = testSession2;
    });
    before(async () => {
      await clientSession
				.post('/search/add')
				.set('Content-type', 'application/json')
				.send({
	  	id: businessId
			});
    });
    before(async () => {
      const date = new Date();
      date.setSeconds(0);
      date.setMilliseconds(0);	
			const business = await Business.findById(businessId).populate('appointments').exec();
      const monthSchedule = business.createMonth();
      const day = monthSchedule.find(day => day.isAvailable);
      date.setDate(day.num);
			const daySchedule = business.createDay(date);
      const time = daySchedule.find(time => time.isAvailable);
      const hour = (time.time).substring(0, 2);
      const minute = (time.time).substring(3);
      date.setHours(parseInt(hour));
			date.setMinutes(parseInt(minute));

			await clientSession
				.post(`/book/${businessId}/book`)
				.set('Content-type', 'application/json')
				.send({
					date: date.toISOString(),
					reason: 'reason'
				});
			const appointments = await Appointment.find({});
			//console.log('1 ' + appointments)
			appointmentId = appointments[0]._id.toString();
		});
		before(async () => {
      const date = new Date();
      date.setSeconds(0);
      date.setMilliseconds(0);
			const business = await Business.findById(businessId).populate('appointments').exec();
      const monthSchedule = business.createMonth();
      const day = monthSchedule.find(day => day.isAvailable);
      date.setDate(day.num);
			const daySchedule = business.createDay(date);
      const time = daySchedule.find(time => time.isAvailable);
      const hour = (time.time).substring(0, 2);
      const minute = (time.time).substring(3);
      date.setHours(parseInt(hour));
			date.setMinutes(parseInt(minute));

			await clientSession
				.post(`/book/${businessId}/book`)
				.set('Content-type', 'application/json')
				.send({
					date: date.toISOString(),
					reason: 'reason'
				});
			const appointments = await Appointment.find({});
			appointmentId1 = appointments[1]._id.toString();
		});
    it('should get an error if user is not logged in', async () => {
      const res = await request(app)
				.post('/home/cancel')
				.set('Content-type', 'application/json')
				.send({
					appointmentId: appointmentId,
				});
      assert.isFalse(res.body.success);
    });
    it('should send an error as json if an error in Appointment.findById()', async () => {
      const findById = sinon.stub(Appointment, 'findById');
      findById.throws(new Error('test error'));
      const res = await clientSession
				.post('/home/cancel')
				.set('Content-type', 'application/json')
				.send({
					appointmentId: appointmentId,
				});
			findById.restore();
      assert.isTrue(res.body.error);
    });
    it('should fail if mongoose id is not valid', async () => {
      const res = await clientSession
				.post('/home/cancel')
				.set('Content-type', 'application/json')
				.send({
					appointmentId: 'invalidId',
				});
      assert.isFalse(res.body.success);
		});
		it('should cancel appointment', async () => {
      const res = await clientSession
				.post('/home/cancel')
				.set('Content-type', 'application/json')
				.send({
					appointmentId: appointmentId,
				});
			const appointment = await Appointment.findById(appointmentId);
      assert.isTrue(appointment.canceled);
		});
		it('should fail if appointment is already canceled', async () => {
      const res = await clientSession
				.post('/home/cancel')
				.set('Content-type', 'application/json')
				.send({
					appointmentId: appointmentId,
				});
      assert.isFalse(res.body.success);
    });
    it('should send success notification', async () => {
      const res = await clientSession
				.post('/home/cancel')
				.set('Content-type', 'application/json')
				.send({
					appointmentId: appointmentId1,
				});
      assert.isTrue(res.body.success);
    });
    after(async () => {
      await User.findOneAndRemove({ 'local.email': 'client@test.com' });
			await User.findOneAndRemove({ 'local.email': 'business@test.com' });
			await Appointment.deleteMany({});
    });
	});

	describe('GET /logout', () => {
    let clientSession;
    let businessSession;
    const testSession1 = session(app);
    const testSession2 = session(app);
    before(async () => {
      await request(app)
				.post('/signup')
				.set('Content-type', 'application/json')
				.send({
					email: 'client@test.com',
					password: 'password',
					confirm: 'password'
				});
      await request(app)
				.post('/signup')
				.set('Content-type', 'application/json')
				.send({
					email: 'business@test.com',
					password: 'password',
					confirm: 'password',
					isBusiness: 'on'
				});
    });
    before(async () => {
      await testSession1
				.post('/login')
				.set('Content-type', 'application/json')
				.send({
					email: 'client@test.com',
					password: 'password'
				});
			clientSession = testSession1;
      await testSession2
				.post('/login')
				.set('Content-type', 'application/json')
				.send({
					email: 'business@test.com',
					password: 'password',
					isBusiness: 'on'
				});
			businessSession = testSession2;
    });
    it('should redirect to / if user in not logged in', async () => {
      const res = await request(app)
				.get('/logout');
      assert.equal(res.headers.location, '/');
		});
    it('should log out from session for clients', async () => {
      const res = await clientSession
				.get('/logout');
			const res1 = await clientSession
				.get('/home');
      assert.equal(res1.headers.location, '/');
		});
		it('should log out from session for businesses', async () => {
      const res = await businessSession
				.get('/logout');
			const res1 = await businessSession
				.get('/home');
      assert.equal(res1.headers.location, '/');
		});
    after(async () => {
      await User.findOneAndRemove({ 'local.email': 'client@test.com' });
      await User.findOneAndRemove({ 'local.email': 'business@test.com' });
    });
  });
	
	


});

