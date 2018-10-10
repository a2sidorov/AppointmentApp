'use strict';

const app = require ('../server');
const assert = require('chai').assert;
const request = require('supertest');
const session = require('supertest-session');
const sinon = require('sinon');
const User = require('../models/user');
const Business = require('../models/business');
const Appointment = require('../models/appointment');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const passwordReset = require('./passwordReset');

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

  describe('GET /signup', () => {
    it('should have status 200', async () => {
      const res = await request(app)
				.get('/signup');
      assert.equal(res.statusCode, 200);
		});	
  });

  describe('POST /signup', () => {
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
					email: 'user@test.com',
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
					email: 'user@test.com',
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
					email: 'user@test.com',
					password: '12345678901234567890a',
					confirm: '12345678901234567890a'
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
					email: 'user@test.com',
					password: 'password',
					confirm: 'password' });
			findOne.restore();
			assert.isTrue(res.body.error);
		});
    it('should succeed with valid email and password (client)', async () => {
      const res = await request(app)
				.post('/signup')
				.set('Content-type', 'application/json')
				.send({
					email: 'client0@test.com',
					password: 'password',
					confirm: 'password'
				});
      assert.isTrue(res.body.success);
		});
		it('should fail if email is already signed up (client)', async () => {
      const res = await request(app)
				.post('/signup')
				.set('Content-type', 'application/json')
				.send({ 
					email: 'client0@test.com',
					password: 'password', 
					confirm: 'password'
				});
      assert.isFalse(res.body.success);
		});
    it('should succeed with valid email and password (business)', async () => {
      const res = await request(app)
				.post('/signup')
				.set('Content-type', 'application/json')
				.send({
					email: 'business0@test.com',
					password: 'password',
					confirm: 'password',
					isBusiness: true
				});
      assert.isTrue(res.body.success);
		});
		it('should fail if email is already signed up (business)', async () => {
      const res = await request(app)
				.post('/signup')
				.set('Content-type', 'application/json')
				.send({
					email: 'business0@test.com',
					password: 'password',
					confirm: 'password',
					isBusiness: true
				});
      assert.isFalse(res.body.success);
		});
    it('should save business0 with kind business', async () => {
			const business0 = await User.findOne({ 'local.email': 'business0@test.com' });
      assert.equal(business0.kind, 'Business');
		});
		it('should have holidays set up to false', async () => {
			const business0 = await User.findOne({ 'local.email': 'business0@test.com' });
      assert.isFalse(business0.holidays[0].isAvailable);
		});
    after(async () => {
			await User.remove({});
			await Appointment.remove({});
		});
	});
	
	describe('POST /login', () => {
		const business0 = new DummyBusiness('business0@test.com', 'password');
		const client0 = new DummyClient('client0@test.com', 'password');
		before( async () => {
			await business0.signup();
			await client0.signup();
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
					password: client0.password
				});
      assert.isFalse(res.body.success);
		});
    it('should fail if email has not been signed up', async () => {
      const res = await request(app)
				.post('/login')
				.set('Content-type', 'application/json')
				.send({
					email: 'unsigned@email.com',
					password: client0.password
				});
      assert.isFalse(res.body.success);
		});
    it('should fail if no password sent', async () => {
      const res = await request(app)
				.post('/login')
				.set('Content-type', 'application/json')
				.send({
					email: client0.email
				});
      assert.isFalse(res.body.success);
		});
    it('should fail if password is incorrect', async () => {
      const res = await request(app)
				.post('/login')
				.set('Content-type', 'application/json')
				.send({
					email: client0.email,
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
				.send({ 
					email: client0.email, 
					password: client0.password 
				});
			findOne.restore();
			assert.isTrue(res.body.error);
		});
    it('should succeed if email and password are correct (client)', async () => {
      const res = await request(app)
				.post('/login')
				.set('Content-type', 'application/json')
				.send({
					email: client0.email,
					password: client0.password
				});
      assert.isTrue(res.body.success);
		});
		it('should succeed if email and password are correct (business)', async () => {
      const res = await request(app)
				.post('/login')
				.set('Content-type', 'application/json')
				.send({
					email: business0.email,
					password: business0.password
				});
      assert.isTrue(res.body.success);
		});
    after(async () => {
			await User.remove({});
			await Appointment.remove({});
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
		const business0 = new DummyBusiness('business0@test.com', 'password');
		const client0 = new DummyClient(process.env.TEST_EMAIL, 'password');
		before( async () => {
			await business0.signup();
			await client0.signup();
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
				.send({ 
					email: 'someemail@test.com' 
				});
			assert.isFalse(res.body.success);
		});
    it('should send an error as JSON if an error in User.findOne()', async () => {
      const findOne = sinon.stub(User, 'findOne');
      findOne.throws(new Error('test error'));
      const res = await request(app)
				.post('/forgot')
				.set('Content-type', 'application/json')
      	.send({ 
					email: client0.email 
				});
      findOne.restore();
      assert.isTrue(res.body.error);
		});
		it('should succeed if email found', async () => {
      const res = await request(app)
				.post('/forgot')
				.set('Content-type', 'application/json')
      	.send({ 
					email: client0.email
				});
      assert.isTrue(res.body.success);
		});
    after(async () => {
			await User.remove({});
			await Appointment.remove({});
		});
  });

  describe('GET /reset/:token', () => {
		const business0 = new DummyBusiness('business0@test.com', 'password');
		const client0 = new DummyClient(process.env.TEST_EMAIL, 'password');
		let token;
		before( async () => {
			await business0.signup();
			await client0.signup();

      /* Spying to get token */
      sinon.spy(crypto, 'randomBytes');
      await request(app)
				.post('/forgot')
				.set('Content-type', 'application/json')
				.send({
					email: client0.email
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
      const clock = sinon.useFakeTimers(Date.now() + (60 * 60 * 1000)); //bending time
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
			await User.remove({});
			await Appointment.remove({});
		});
  });

  describe('POST /reset/:token', () => {
		const business0 = new DummyBusiness('business0@test.com', 'password');
		const client0 = new DummyClient(process.env.TEST_EMAIL, 'password');
		let token;
		before( async () => {
			await business0.signup();
			await business0.login();

			await client0.signup();
			await client0.login();

      /* Spying to get token */
			sinon.spy(crypto, 'randomBytes');
      await request(app)
				.post('/forgot')
				.set('Content-type', 'application/json')
				.send({
					email: business0.email
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
			await User.remove({});
			await Appointment.remove({});
		});
	});
	
  describe('GET /home', () => {
		const business0 = new DummyBusiness('business0@test.com', 'password');
		const client0 = new DummyClient('client0@test.com', 'password');
		before( async () => {
			await business0.signup();
			await business0.login();
			await client0.signup();
			await client0.login();
		});
    it('should redirect to / if user in not logged in', async () => {
      const res = await request(app)
				.get('/home');
      assert.equal(res.headers.location, '/');
		});
    it('should redirect to error page if an error in Appointment.find', async () => {
      const find = sinon.stub(Appointment, 'find');
      find.throws(new Error('test error'));
      const res = await client0.session
				.get('/home');
			find.restore();
      assert.equal(res.header.location, '/error/500');
		});
    it('should redirect to error page if an error in User.findById', async () => {
      const findById = sinon.stub(User, 'findById');
      findById.throws(new Error('test error'));
      const res = await client0.session
				.get('/home');
      findById.restore();
      assert.equal(res.header.location, '/error/500');
		});
    it('should get home page', async () => {
      const res = await client0.session
				.get('/home');
      assert.equal(res.headers.view, 'client-home');
		});
    it('should get home page', async () => {
      const res = await business0.session
				.get('/home');
      assert.equal(res.headers.view, 'business-home');
		});
    after(async () => {
			await User.remove({});
			await Appointment.remove({});
		});
		
  });

  describe('GET /schedule', () => {
		const business0 = new DummyBusiness('business0@test.com', 'password');
		const client0 = new DummyClient('client0@test.com', 'password');
		before( async () => {
			await business0.signup();
			await business0.login();

			await client0.signup();
			await client0.login();
		});
    it('should redirect to / if user is not logged in', async () => {
      const res = await request(app)
				.get('/schedule');
      assert.equal(res.headers.location, '/');
		});
    it('should redirect to / if user is not business', async () => {
      const res = await client0.session
				.get('/schedule');
      assert.equal(res.headers.location, '/');
		});
    it('should get schedule page', async () => {
      const res = await business0.session
				.get('/schedule');
      assert.equal(res.statusCode, 200);
		});
    after(async () => {
			await User.remove({});
			await Appointment.remove({});
		});
  });
    
  describe('POST /schedule/update', () => {
    const business0 = new DummyBusiness('business0@test.com', 'password');
		const client0 = new DummyClient('client0@test.com', 'password');
		before( async () => {
			await business0.signup();
			await business0.login();

			await client0.signup();
			await client0.login();
		});
    it('should fail if user is not logged in', async () => {
      const res = await request(app)
				.post('/schedule/update')
				.set('Content-type', 'application/json')
				.send();
			assert.isFalse(res.body.success);
		});
    it('should fail if user is not business', async () => {
      const res = await client0.session
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
      const res = await business0.session
				.post('/schedule/update')
				.set('Content-type', 'application/json')
				.send({
					days: '',
					time: '',
					holidays: ''
				});
      assert.isFalse(res.body.success);
		});
    it('should send an error as json if an error in business.findById()', async () => {
      const findById = sinon.stub(Business, 'findById');
      findById.throws(new Error('test error'));
      const res = await business0.session
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
      const res = await business0.session
				.post('/schedule/update')
				.set('Content-type', 'application/json')
				.send({
					days: [{dayNum: '6', isAvailable: true}],
					time: '',
					holidays: ''
				});
			const business = await User.findOne({ 'local.email': business0.email });
      assert.isTrue(business.workdays[5].isAvailable);
		});
    it('should send success notification', async () => {
      const res = await business0.session
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
			await User.remove({});
			await Appointment.remove({});
		});
	
	});
	
	describe('POST /schedule/active', () => {
    const business0 = new DummyBusiness('business0@test.com', 'password');
		const client0 = new DummyClient('client0@test.com', 'password');
		before( async () => {
			await business0.signup();
			await business0.login();

			await client0.signup();
			await client0.login();
		});
    it('should fail if user is not logged in', async () => {
      const res = await request(app)
				.post('/schedule/active')
				.set('Content-type', 'application/json')
				.send({
					active: true
				});
				assert.isFalse(res.body.success);
		});
    it('should fail if user is not business0', async () => {
      const res = await client0.session
				.post('/schedule/active')
				.set('Content-type', 'application/json')
				.send({
					active: true
				});
      assert.isFalse(res.body.success);
		});
    it('should fail if no data sent', async () => {
      const res = await business0.session
				.post('/schedule/active')
				.set('Content-type', 'application/json')
				.send({
				});
      assert.isFalse(res.body.success);
		});
		it('should fail if sent data is not boolean type', async () => {
      const res = await business0.session
				.post('/schedule/active')
				.set('Content-type', 'application/json')
				.send({
					active: 0
				});
      assert.isFalse(res.body.success);
		});
    it('should send an error as json if an error in Business.findById()', async () => {
      const findById = sinon.stub(Business, 'findById');
      findById.throws(new Error('test error'));
      const res = await business0.session
				.post('/schedule/active')
				.set('Content-type', 'application/json')
				.send({
					active: true
				});
			findById.restore();
      assert.isTrue(res.body.error);
		});
		it('should start business schedule', async () => {
      const res = await business0.session
				.post('/schedule/active')
				.set('Content-type', 'application/json')
				.send({
					active: true
				});
			const business = await Business.findOne({ 'local.email': business0.email });
      assert.isTrue(business.active);
		});
		it('should stop business schedule', async () => {
      const res = await business0.session
				.post('/schedule/active')
				.set('Content-type', 'application/json')
				.send({
				  active: false
				});
      const business = await Business.findOne({ 'local.email': business0.email });
      assert.isFalse(business.active);
		});
    it('should send success notification', async () => {
      const res = await business0.session
				.post('/schedule/active')
				.set('Content-type', 'application/json')
				.send({
					active: true
				});
      assert.isTrue(res.body.success);
		});
    after(async () => {
			await User.remove({});
			await Appointment.remove({});
		});
  });

  describe('GET /profile', () => {
    const business0 = new DummyBusiness('business0@test.com', 'password');
		const client0 = new DummyClient('client0@test.com', 'password');
		before( async () => {
			await business0.signup();
			await business0.login();

			await client0.signup();
			await client0.login();
		});
    it('should redirect to / if user in not logged in', async () => {
      const res = await request(app)
				.get('/profile');
      assert.equal(res.headers.location, '/');
    });
    it('should get profile page if user is client0', async () => {
      const res = await client0.session
				.get('/profile');
      assert.equal(res.header.view, 'client-profile');
    });
    it('should get profile page if user is business0', async () => {
      const res = await business0.session
				.get('/profile');
      assert.equal(res.header.view, 'business-profile');
    });
    after(async () => {
			await User.remove({});
			await Appointment.remove({});
    });
  });

  describe('POST /profile/update', () => {
    const business0 = new DummyBusiness('business0@test.com', 'password');
		const client0 = new DummyClient('client0@test.com', 'password');
		before( async () => {
			await business0.signup();
			await business0.login();

			await client0.signup();
			await client0.login();
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
      const res = await client0.session
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
      const res = await client0.session
				.post('/profile/update')
				.set('Content-type', 'application/json')
				.send({
					firstname: 'foo',
					lastname: 'bar'
				});
      findById.restore();
      assert.isTrue(res.body.error);
    });
    it('should update client0 profile', async () => {
      const res = await client0.session
				.post('/profile/update')
				.set('Content-type', 'application/json')
				.send({
					firstname: 'foo',
					lastname: 'bar'
				});
      const user = await User.findOne({ 'local.email': 'client0@test.com' });
      assert.equal(user.firstname, 'foo');
      assert.equal(user.lastname, 'bar');
    });
    it('should update business profile', async () => {
      const res = await business0.session
				.post('/profile/update')
				.set('Content-type', 'application/json')
				.send({
					firstname: 'foo',
					lastname: 'bar'
				});
      const user = await Business.findOne({ 'local.email': 'business0@test.com' });
      assert.equal(user.firstname, 'foo');
      assert.equal(user.lastname, 'bar');
    });
    it('should send success notification', async () => {
      const res = await client0.session
				.post('/profile/update')
				.set('Content-type', 'application/json')
				.send({
					firstname: 'newFirstName',
					lastname: 'newLastName'
				});
      assert.isTrue(res.body.success);
    });
    after(async () => {
			await User.remove({});
			await Appointment.remove({});
    });
	});

	describe('POST /profile/delete', () => {
		const business0 = new DummyBusiness('business0@test.com', 'password');
		const business1 = new DummyBusiness('business1@test.com', 'password');
		const client0 = new DummyClient('client0@test.com', 'password');
		before( async () => {
			await business0.signup();
			await business0.login();
			await business0.activateSchedule();

			await business1.signup();
			await business1.login();
			await business1.activateSchedule();

			await client0.signup();
			await client0.login();

			await business0.getFirstAvailableTime();
			await client0.makeAppointment(business0.id, business0.firstAvailableTime);

			await business0.getFirstAvailableTime();
			await client0.makeAppointment(business0.id, business0.firstAvailableTime);

			await business1.getFirstAvailableTime();
			await client0.makeAppointment(business1.id, business1.firstAvailableTime);

			await business1.getFirstAvailableTime();
			await client0.makeAppointment(business1.id, business1.firstAvailableTime);
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
      const res = await client0.session
				.post('/profile/delete')
				.set('Content-type', 'application/json')
				.send({
				});
      assert.isFalse(res.body.success);
		});
		it('should fail if password is incorrent', async () => {
      const res = await client0.session
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
      const res = await client0.session
				.post('/profile/delete')
				.set('Content-type', 'application/json')
				.send({
					password: 'password'
				});
      findById.restore();
      assert.isTrue(res.body.error);
		});
    it('should delete client0 account', async () => {
      const res = await client0.session
				.post('/profile/delete')
				.set('Content-type', 'application/json')
				.send({
					password: 'password'
				});
			const user = await User.findOne({ 'local.email': 'client0@test.com' });
      assert.isNull(user);
		});
		it('should cancel business0 appointments', async () => {
      const res = await business0.session
				.post('/profile/delete')
				.set('Content-type', 'application/json')
				.send({
					password: 'password'
				});
			const appointment = await Appointment.findOne({ 'business': business0.id });
      assert.isTrue(appointment.canceled);
		});
		it('should fail to get home page for client0s', async () => {
			const res = await client0.session
				.get('/home');
      assert.notEqual(res.statusCode, 200);
		});
    it('should send success notification', async () => {
      const res = await business1.session
				.post('/profile/delete')
				.set('Content-type', 'application/json')
				.send({
					password: 'password'
				});
      assert.isTrue(res.body.success);
		});
    after(async () => {
			await User.remove({});
			await Appointment.remove({});
    });
	});
	
  describe('GET /search', () => {
    const business0 = new DummyBusiness('business0@test.com', 'password');
		const client0 = new DummyClient('client0@test.com', 'password');
		before( async () => {
			await business0.signup();
			await business0.login();
			await client0.signup();
			await client0.login();
    });
    it('should redirect to / if user in not logged in', async () => {
      const res = await request(app)
				.get('/search');
      assert.equal(res.headers.location, '/');
    });
    it('should redirect to / if user is business', async () => {
      const res = await business0.session
				.get('/search');
      assert.equal(res.headers.location, '/');
    });
    it('should get the page if user is client', async () => {
      const res = await client0.session
				.get('/search');
      assert.equal(res.statusCode, 200);
    });
    after(async () => {
      await User.remove({});
    });
  });

  describe('POST /search/:pattern', () => {
    const business0 = new DummyBusiness('business0@test.com', 'password');
		const business1 = new DummyBusiness('business1@test.com', 'password');
		const client0 = new DummyClient('client0@test.com', 'password');
		before( async () => {
			await business0.signup();
			await business0.login();
			await business1.signup();
			await client0.signup();
			await client0.login();
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
    it('should fail if user is business', async () => {
      const res = await business0.session
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
      const res = await client0.session
				.post('/search')
				.set('Content-type', 'application/json')
				.send({
					pattern: 'b',
				});
      find.restore();
      assert.isTrue(res.body.error);
		});
		it('should fail if no match found', async () => {
      const res = await client0.session
				.post('/search')
				.set('Content-type', 'application/json')
				.send({
					pattern: 'nonexist',
				});
      assert.isFalse(res.body.success);
    });
    it('should get matching businesses', async () => {
      const res = await client0.session
				.post('/search')
				.set('Content-type', 'application/json')
				.send({
					pattern: 'b',
				});
      assert.equal(res.body.results[0].local.email, business0.email);
		});
		it('should send success notification if a match found', async () => {
      const res = await client0.session
				.post('/search')
				.set('Content-type', 'application/json')
				.send({
					pattern: 'b',
				});
      assert.isTrue(res.body.success);
    });
    after(async () => {
      await User.remove({});
    });
  });

  describe('POST /search/add', () => {
		const business0 = new DummyBusiness('business0@test.com', 'password');
		const business1 = new DummyBusiness('business1@test.com', 'password');
		const client0 = new DummyClient('client0@test.com', 'password');
		before( async () => {
			await business0.signup();
			await business0.login();
			await business1.signup();
			await client0.signup();
			await client0.login();
    });
    it('should fail if user in not logged in', async () => {
      const res = await request(app)
				.post('/search/add')
				.set('Content-type', 'application/json')
				.send({
					id: business0.id
				});
      assert.isFalse(res.body.success);
    });
    it('should fail if user is not client0', async () => {
      const res = await business0.session
				.post('/search/add')
				.set('Content-type', 'application/json')
				.send({
					id: business0.id
				});
      assert.isFalse(res.body.success);
    });
    it('should send an error as json if an error in User.findById()', async () => {
      const findById = sinon.stub(User, 'findById');
      findById.throws(new Error('test error'));
      const res = await client0.session
				.post('/search/add')
				.set('Content-type', 'application/json')
				.send({
					id: business0.id
				});
      findById.restore();
      assert.isTrue(res.body.error);
    });
    it('should fail if no id sent', async () => {
      const res = await client0.session
				.post('/search/add')
				.set('Content-type', 'application/json')
				.send({
					id: ''
				});
      assert.isFalse(res.body.success);
    });
    it('should fail if sent data is not mongoose id', async () => {
      const res = await client0.session
				.post('/search/add')
				.set('Content-type', 'application/json')
				.send({
					id: 'eqr1234;'
				});
      assert.isFalse(res.body.success);
    });
    it('should add business0 to client0 contact list', async () => {
      const res = await client0.session
				.post('/search/add')
				.set('Content-type', 'application/json')
				.send({
					id: business0.id
				});
      const user = await User.findOne({ 'local.email': client0.email }, 'contacts');
      assert.equal(user.contacts[0].toString(), business0.id);
    });
    it('should fail if business0 is already in contact list', async () => {
      const res = await client0.session
				.post('/search/add')
				.set('Content-type', 'application/json')
				.send({
					id: business0.id
				});
      assert.isFalse(res.body.success);
		});
		it('should send success notification', async () => {
      const res = await client0.session
				.post('/search/add')
				.set('Content-type', 'application/json')
				.send({
					id: business1.id
				});
      assert.isTrue(res.body.success);
    });
    after(async () => {
      await User.remove({});
    });
  });

  describe('POST /search/remove', () => {
		const business0 = new DummyBusiness('business0@test.com', 'password');
		const business1 = new DummyBusiness('business1@test.com', 'password');
		const client0 = new DummyClient('client0@test.com', 'password');
		before( async () => {
			await business0.signup();
			await business0.login();
			await business1.signup();
			await client0.signup();
			await client0.login();
			await client0.add(business0.id);
			await client0.add(business1.id);
    });
    it('should fail if user in not logged in', async () => {
      const res = await request(app)
				.post('/search/remove')
				.set('Content-type', 'application/json')
				.send({
					id: business0.id
				});
      assert.isFalse(res.body.success);
    });
    it('should fail if user is not client', async () => {
      const res = await business0.session
				.post('/search/remove')
				.set('Content-type', 'application/json')
				.send({
					id: business0.id
				});
      assert.isFalse(res.body.success);
    });
    it('should send an error as json if an error in User.findById()', async () => {
      const findById = sinon.stub(User, 'findById');
      findById.throws(new Error('test error'));
      const res = await client0.session
				.post('/search/remove')
				.set('Content-type', 'application/json')
				.send({
					id: business0.id
				});
      findById.restore();
      assert.isTrue(res.body.error);
    });
    it('should fail if no id sent', async () => {
      const res = await client0.session
				.post('/search/remove')
				.set('Content-type', 'application/json')
				.send({
					id: ''
				});
      assert.isFalse(res.body.success);
    });
    it('should remove business0 from  client contact list', async () => {
      const res = await client0.session
				.post('/search/remove')
				.set('Content-type', 'application/json')
				.send({
					id: business0.id
				});
      const user = await User.findOne({ 'local.email': 'client0@test.com' }, 'contacts');
      const contacts = user.contacts.map(id => id.toString());
      assert.isFalse(contacts.includes(business0.id));
    });
    
    it('should fail if business0 is not in contact list', async () => {
      const res = await client0.session
				.post('/search/remove')
				.set('Content-type', 'application/json')
				.send({
					id: business0.id
				});
      assert.isFalse(res.body.success);
		});
		it('should send success notification', async () => {
      const res = await client0.session
				.post('/search/remove')
				.set('Content-type', 'application/json')
				.send({
					id: business1.id
				});
      assert.isTrue(res.body.success);
    });
    after(async () => {
      await User.remove({});
			await Appointment.remove({});
    });
	});

	describe('GET /contacts', () => {
    const business0 = new DummyBusiness('business0@test.com', 'password');
		const client0 = new DummyClient('client0@test.com', 'password');
		before( async () => {
			await business0.signup();
			await business0.login();
			await client0.signup();
			await client0.login();
		});
    it('should redirect to / if user in not logged in', async () => {
      const res = await request(app)
				.get('/contacts');
      assert.equal(res.headers.location, '/');
		});
		it('hould redirect to / if user in not client', async () => {
      const res = await business0.session
				.get('/contacts');
			assert.equal(res.headers.location, '/');
		});
		it('should redirect to error page if an error in User.findById()', async () => {
      const findById = sinon.stub(User, 'findById');
      findById.throws(new Error('test error'));
			const res = await client0.session
				.get('/contacts');
      findById.restore();
      assert.equal(res.headers.location, '/error/500');
    });
    it('should get contact page if user is client', async () => {
      const res = await client0.session
				.get('/contacts');
      assert.equal(res.statusCode, 200);
    });
    after(async () => {
      await User.remove({});
			await Appointment.remove({});
    });
  });

  describe('GET /book/nocontacts', () => {
		const business0 = new DummyBusiness('business0@test.com', 'password');
		const client0 = new DummyClient('client0@test.com', 'password');
		before( async () => {
			await business0.signup();
			await business0.login();
			await client0.signup();
			await client0.login();
		});
    it('should redirect to / if user in not logged in', async () => {
      const res = await request(app)
				.get('/book/nocontacts');
      assert.equal(res.headers.location, '/');
    });
    it('should redirect to / if user is not client', async () => {
      const res = await business0.session
				.get('/book/nocontacts');
      assert.equal(res.headers.location, '/');
    });
    it('should get the page if user is client', async () => {
      const res = await client0.session
				.get('/book/nocontacts');
      assert.equal(res.statusCode, 200);
    });
    after(async () => {
      await User.remove({});
			await Appointment.remove({});
    });
  });

  describe('GET /book/:id', () => {
    const business0 = new DummyBusiness('business0@test.com', 'password');
		const client0 = new DummyClient('client0@test.com', 'password');
		let date;
		before( async () => {
			await business0.signup();
			await business0.login();
			await client0.signup();
			await client0.login();
		});
    it('should redirect to / if user in not logged in', async () => {
      const res = await request(app)
				.get(`/book/${business0.id}`);
      assert.equal(res.headers.location, '/');
    });
    it('should redirect to / if user is not client', async () => {
      const res = await business0.session
				.get(`/book/${business0.id}`);
      assert.equal(res.headers.location, '/');
    });
    it('should redirect to error page if business0 id is not valid', async () => {
      const res = await client0.session
				.get('/book/{"$gt":""}');
      assert.equal(res.headers.location, '/error/404');
    });
    it('should redirect to error page if an error in User.findById()', async () => {
      const findById = sinon.stub(User, 'findById');
      findById.throws(new Error('test error'));
      const res = await client0.session
				.get(`/book/${business0.id}`);
      findById.restore();
      assert.equal(res.headers.location, '/error/500');
    });
    it('should get booking page', async () => {
      const res = await client0.session
				.get(`/book/${business0.id}`);
      assert.equal(res.statusCode, 200);
    });
    after(async () => {
      await User.remove({});
			await Appointment.remove({});
    });
  });

  describe('POST /book/:id/month', () => {
    const business0 = new DummyBusiness('business0@test.com', 'password');
		const client0 = new DummyClient('client0@test.com', 'password');
		let date;
		before( async () => {
			await business0.signup();
			await business0.login();
			await client0.signup();
			await client0.login();
		});
    before(async () => {
      date = new Date();
      date.setSeconds(0);
      date.setMilliseconds(0);
    });
    it('should fail if user is not logged in', async () => {
      const res = await request(app)
				.post(`/book/${business0.Id}/month`)
				.set('Content-type', 'application/json')
				.send({
					dateISO: date.toISOString(),
					month: 'next'
				});
      assert.isFalse(res.body.success);
    });
    it('should redirect to / if user is not client0', async () => {
      const res = await business0.session
				.post(`/book/${business0.id}/month`)
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
      const res = await client0.session
				.post(`/book/${business0.id}/month`)
				.set('Content-type', 'application/json')
				.send({
					dateISO: date.toISOString(),
					month: 'next'
				});
      findById.restore();
      assert.isTrue(res.body.error);
    });
    it('should fail if sent data is not mongoose id', async () => {
      const res = await client0.session
				.post('/book/incorrectid/month')
				.set('Content-type', 'application/json')
				.send({
					dateISO: date.toISOString(),
					month: 'next'
				});
      assert.isFalse(res.body.success);
    });
    it('should send next month schedule', async () => {
      const res = await client0.session
				.post(`/book/${business0.id}/month`)
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
      const res = await client0.session
				.post(`/book/${business0.id}/month`)
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
      const res = await client0.session
				.post(`/book/${business0.id}/month`)
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
      const res = await client0.session
				.post(`/book/${business0.id}/month`)
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
      const res = await client0.session
				.post(`/book/${business0.id}/month`)
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
      const res = await client0.session
				.post(`/book/${business0.id}/month`)
				.set('Content-type', 'application/json')
				.send({
					dateISO: date.toISOString(),
					month: 'next'
				});
      assert.isTrue(res.body.success);
    });
    after(async () => {
      await User.remove({});
			await Appointment.remove({});
    });
  });

  describe('POST /book/:id/day', () => {
    const business0 = new DummyBusiness('business0@test.com', 'password');
		const client0 = new DummyClient('client0@test.com', 'password');
		before( async () => {
			await business0.signup();
			await business0.login();
			await client0.signup();
			await client0.login();
			await business0.getFirstAvailableTime();
		});
    it('should fail if user is not logged in', async () => {
      const res = await request(app)
				.post(`/book/${business0.id}/day`)
				.set('Content-type', 'application/json')
				.send({
					dateISO: business0.firstAvailableTime.toISOString(),
					day: business0.firstAvailableDay
				});
      assert.isFalse(res.body.success);
    });
    it('should redirect to / if user is not client', async () => {
      const res = await business0.session
				.post(`/book/${business0.id}/day`)
				.set('Content-type', 'application/json')
				.send({
					dateISO: business0.firstAvailableTime.toISOString(),
					day: business0.firstAvailableDay
				});
      assert.isFalse(res.body.success);
    });
    it('should send an error as json if an error in Business.findById()', async () => {
      const findById = sinon.stub(Business, 'findById');
      findById.throws(new Error('test error'));
      const res = await client0.session
				.post(`/book/${business0.id}/day`)
				.set('Content-type', 'application/json')
				.send({
					dateISO: business0.firstAvailableTime.toISOString(),
					day: business0.firstAvailableDay
				});
      findById.restore();
      assert.isTrue(res.body.error);
    });
    it('should fail if business0 id is not valid', async () => {
      const res = await client0.session
				.post('/book/incorrectid/day')
				.set('Content-type', 'application/json')
				.send({
					dateISO: business0.firstAvailableTime.toISOString(),
					day: business0.firstAvailableDay
				});
      assert.isFalse(res.body.success);
    });
    it('should send business schedule for a chosen day', async () => {
      const res = await client0.session
				.post(`/book/${business0.id}/day`)
				.set('Content-type', 'application/json')
				.send({
					dateISO: business0.firstAvailableTime.toISOString(),
					day: business0.firstAvailableDay
				});
      assert.isArray(res.body.hours);
      assert.isTrue(res.body.hours.length > 0);
      assert.property(res.body.hours[0], 'time');
      assert.property(res.body.hours[0], 'isAvailable');
    });
    it('should send success notification', async () => {
      const res = await client0.session
				.post(`/book/${business0.id}/day`)
				.set('Content-type', 'application/json')
				.send({
					dateISO: business0.firstAvailableTime.toISOString(),
					day: business0.firstAvailableDay
				});
      assert.isTrue(res.body.success);
    });
    after(async () => {
      await User.remove({});
			await Appointment.remove({});
    });
  });

  describe('POST /book/:id/book', () => {
		const business0 = new DummyBusiness('business0@test.com', 'password');
		const business1 = new DummyBusiness('business1@test.com', 'password');
		const client0 = new DummyClient('client0@test.com', 'password');
		before( async () => {
			await business0.signup();
			await business0.login();
			await business0.activateSchedule();
			await business0.getFirstAvailableTime();
			
			await business1.signup();
			await business1.login();
			await business1.getFirstAvailableTime();

			await client0.signup();
			await client0.login();
			
		});
    it('should get an error if user is not logged in', async () => {
      const res = await request(app)
				.post(`/book/${business0.id}/book`)
				.set('Content-type', 'application/json')
				.send({
					dateISO: business0.firstAvailableTime.toISOString(),
				});
      assert.isFalse(res.body.success);
    });
    it('should redirect to / if user is not client', async () => {
      const res = await business0.session
				.post(`/book/${business0.id}/book`)
				.set('Content-type', 'application/json')
				.send({
					dateISO: business0.firstAvailableTime.toISOString(),
				});
      assert.isFalse(res.body.success);
    });
    it('should send an error as json if an error in Business.findById()', async () => {
      const findById = sinon.stub(Business, 'findById');
      findById.throws(new Error('test error'));
      const res = await client0.session
				.post(`/book/${business0.id}/book`)
				.set('Content-type', 'application/json')
				.send({
					dateISO: business0.firstAvailableTime.toISOString(),
				});
      findById.restore();
      assert.isTrue(res.body.error);
    });
    it('should fail if business id is not valid', async () => {
      const res = await client0.session
				.post('/book/incorrectid/book')
				.set('Content-type', 'application/json')
				.send({
					dateISO: business0.firstAvailableTime.toISOString(),
				});
      assert.isFalse(res.body.success);
		});
		it('should fail if reason has words longer than 30 characters', async () => {
      const res = await client0.session
				.post(`/book/${business0.id}/book`)
				.set('Content-type', 'application/json')
				.send({
					dateISO: business1.firstAvailableTime.toISOString(),
					reason: '0123456789012345678901234567890'
				});
				console.log(res.body)
			assert.isFalse(res.body.success);
		});
    it('should create an apoointment', async () => {
      const res = await client0.session
				.post(`/book/${business0.id}/book`)
				.set('Content-type', 'application/json')
				.send({
					dateISO: business0.firstAvailableTime.toISOString(),
					reason: '012345678901234567890123456789'
				});
			console.log(res.body)
			const appointment = await Appointment.findOne({ 'business': business0.id });
			assert.equal(appointment.reason, '012345678901234567890123456789');
			assert.isFalse(appointment.canceled);
      assert.property(appointment, 'user');
			assert.property(appointment, 'business');
			assert.property(appointment, 'date');
			assert.property(appointment, 'reason');
			assert.property(appointment, 'canceled');
		});
		it('should fail if business schedule is not active', async () => {
      const res = await client0.session
				.post(`/book/${business1.id}/book`)
				.set('Content-type', 'application/json')
				.send({
					dateISO: business1.firstAvailableTime.toISOString(),
					reason: 'reason'
				});
			assert.isFalse(res.body.success);
		});
		it('should fail if requested time already booked', async () => {
      const res = await client0.session
				.post(`/book/${business0.id}/book`)
				.set('Content-type', 'application/json')
				.send({
					dateISO: business0.firstAvailableTime.toISOString(),
					reason: 'reason'
				});
			assert.isFalse(res.body.success);
		});
		it('should fail if appointment time starts less than in 30 minutes', async () => {
			const clock = sinon.useFakeTimers(business0.firstAvailableTime.getTime() - 29 * 60 * 1000 );
      const res = await client0.session
				.post(`/book/${business0.id}/book`)
				.set('Content-type', 'application/json')
				.send({
					dateISO: business0.firstAvailableTime.toISOString(),
					reason: 'reason'
				});
				clock.restore();
			assert.isFalse(res.body.success);
		});
		it('should bound appointment to business0', async () => {
			const business0 = await Business.findOne({ 'local.email': 'business0@test.com'});
			assert.equal(business0.appointments.length, 1);
		});
		it('should bound appointment to client', async () => {
			const client0 = await User.findOne({ 'local.email': 'client0@test.com'});
			assert.equal(client0.appointments.length, 1);
    });
    it('should send success notification', async () => {
			await Appointment.deleteMany({});
      const res = await client0.session
				.post(`/book/${business0.id}/book`)
				.set('Content-type', 'application/json')
				.send({
					dateISO: business0.firstAvailableTime.toISOString(),
					reason: 'reason'
				});
      assert.isTrue(res.body.success);
		});
		
    after(async () => {
			await User.remove({});
			await Appointment.remove({});
    });
	});

	describe('POST /home/cancel',() => {
		const business0 = new DummyBusiness('business0@test.com', 'password');
		const client0 = new DummyClient('client0@test.com', 'password');
		before( async () => {
			await business0.signup();
			await business0.login();
			await business0.activateSchedule();

			await client0.signup();
			await client0.login();

			await business0.getFirstAvailableTime();
			await client0.makeAppointment(business0.id, business0.firstAvailableTime);
			await business0.getFirstAvailableTime();
			await client0.makeAppointment(business0.id, business0.firstAvailableTime);
		});
    it('should get an error if user is not logged in', async () => {
      const res = await request(app)
				.post('/home/cancel')
				.set('Content-type', 'application/json')
				.send({
					appointmentId: client0.appointments[0],
				});
      assert.isFalse(res.body.success);
    });
    it('should send an error as json if an error in Appointment.findById()', async () => {
      const findById = sinon.stub(Appointment, 'findById');
      findById.throws(new Error('test error'));
      const res = await client0.session
				.post('/home/cancel')
				.set('Content-type', 'application/json')
				.send({
					appointmentId: client0.appointments[0],
				});
			findById.restore();
      assert.isTrue(res.body.error);
    });
    it('should fail if mongoose id is not valid', async () => {
      const res = await client0.session
				.post('/home/cancel')
				.set('Content-type', 'application/json')
				.send({
					appointmentId: 'invalidId',
				});
      assert.isFalse(res.body.success);
		});
		it('should cancel appointment', async () => {
      const res = await client0.session
				.post('/home/cancel')
				.set('Content-type', 'application/json')
				.send({
					appointmentId: client0.appointments[0],
				});
			const appointment = await Appointment.findById(client0.appointments[0]);
      assert.isTrue(appointment.canceled);
		});
		it('should fail if appointment is already canceled', async () => {
      const res = await client0.session
				.post('/home/cancel')
				.set('Content-type', 'application/json')
				.send({
					appointmentId: client0.appointments[0],
				});
      assert.isFalse(res.body.success);
    });
    it('should send success notification', async () => {
      const res = await client0.session
				.post('/home/cancel')
				.set('Content-type', 'application/json')
				.send({
					appointmentId: client0.appointments[1],
				});
      assert.isTrue(res.body.success);
    });
    after(async () => {
			await User.remove({});
			await Appointment.remove({});
    });
	});

	describe('GET /logout', () => {
    const business0 = new DummyBusiness('business0@test.com', 'password');
		const client0 = new DummyClient('client0@test.com', 'password');
		before( async () => {
			await business0.signup();
			await business0.login();
			await client0.signup();
			await client0.login();
		});
    it('should redirect to / if user in not logged in', async () => {
      const res = await request(app)
				.get('/logout');
      assert.equal(res.headers.location, '/');
		});
    it('should log out from session for client0s', async () => {
      const res = await client0.session
				.get('/logout');
			const res1 = await client0.session
				.get('/home');
      assert.equal(res1.headers.location, '/');
		});
		it('should log out from session for business0es', async () => {
      await business0.session
				.get('/logout');
			const res1 = await business0.session
				.get('/home');
      assert.equal(res1.headers.location, '/');
		});
    after(async () => {
      await User.remove({});
			await Appointment.remove({});
    });
  });
});

function DummyClient (email, password) {
	this.email = email;
	this.password = password;
	this.session = session(app);
	this.id = '';
	this.appointments = [];
	this.signup = async function () {
		await request(app)
		.post('/signup')
		.set('Content-type', 'application/json')
		.send({
			email: this.email,
			password: this.password,
			confirm: this.password,
		});
		const client = await User.findOne({ 'local.email': this.email }, '_id');
    this.id = client._id.toString();
	};
	this.login = async function () {
		await this.session
			.post('/login')
			.set('Content-type', 'application/json')
			.send({
				email: this.email,
				password: this.password
			});
	};
	this.makeAppointment = async function(businessId, date) {
		await this.session
			.post(`/book/${businessId}/book`)
			.set('Content-type', 'application/json')
			.send({
				dateISO: date.toISOString(),
				reason: 'reason'
			});

		const appointments = await Appointment.find({ 'business': businessId });
		this.appointments = appointments.map(appointment => appointment._id.toString());
	};
	this.add = async function(businessId) {
      await this.session
				.post('/search/add')
				.set('Content-type', 'application/json')
				.send({
	  			id: businessId
				});

	};
}

function DummyBusiness (email, password) {
	this.email = email;
	this.password = password;
	this.session = session(app);
	this.id = "";
	this.firstAvailableDay = 0;
	this.firstAvailableTime = {};
	this.signup = async function () {
		await request(app)
		.post('/signup')
		.set('Content-type', 'application/json')
		.send({
			email: this.email,
			password: this.password,
			confirm: this.password,
			isBusiness: true
		});
		const business = await Business.findOne({ 'local.email': this.email }, '_id');
  	this.id = business._id.toString();
	};
	this.login = async function () {
		await this.session
			.post('/login')
			.set('Content-type', 'application/json')
			.send({
				email: this.email,
				password: this.password
			});
	};
	this.getFirstAvailableTime = async function () {
		const date = new Date();
    date.setSeconds(0);
		date.setMilliseconds(0);
		const business = await Business.findById(this.id).populate('appointments').exec();
    let monthSchedule = business.createMonth();
		let day = monthSchedule.find(day => day.isAvailable);
		if (!day) {
			let month = date.getMonth();
      let year = date.getFullYear();
			if (month + 1 > 11) {
				date.setMonth(0);
				date.setFullYear(year++);
			} else {
				date.setMonth(month++);
			}
			monthSchedule = business.createMonth(date);
			day = monthSchedule.find(day => day.isAvailable);
		}
		this.firstAvailableDay = day.num;
		date.setDate(day.num);
		const daySchedule = business.createDay(date);
		const time = daySchedule.find(time => time.isAvailable);
		const hour = (time.time).substring(0, 2);
		const minute = (time.time).substring(3);
		date.setHours(parseInt(hour));
		date.setMinutes(parseInt(minute));
		this.firstAvailableTime = date;
	};
	this.activateSchedule = async function () {
		await this.session
				.post('/schedule/active')
				.set('Content-type', 'application/json')
				.send({
					active: true
				});
	};
	this.deactivateSchedule = async function () {
		await this.session
				.post('/schedule/active')
				.set('Content-type', 'application/json')
				.send({
					active: false
				});
	};
}



