'use strict';

const app = require ('./app');
const assert = require('chai').assert;
const request = require('supertest');
const session = require('supertest-session');
const User = require('./models/user');
const mongoose = require('mongoose');

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
    it('should fail if no email sent', async () => {
      const res = await request(app)
        .post('/login')
        .send({ password: 'password' });
      assert.isFalse(res.body.success);
    });
    it('should fail if email has not been signed up', async () => {
      const res = await request(app)
        .post('/login')
        .send({ email: 'unsigned@email.com', password: 'password' });
      assert.isFalse(res.body.success);
    });
    it('should fail if no password sent', async () => {
      const res = await request(app)
        .post('/login')
        .send({ email: 'test@test.com' });
      assert.isFalse(res.body.success);
    });
    it('should fail if password is incorrect', async () => {
      const res = await request(app)
        .post('/login')
        .send({ email: 'test@test.com', password: 'incorrectPassword' });
      assert.isFalse(res.body.success);
    });
    it('should succeed if email and password are correct', async () => {
      const res = await request(app)
        .post('/login')
        .send({ email: 'test@test.com', password: 'password' });
      assert.isTrue(res.body.success);
    });
    after(async () => {
      await User.findOneAndRemove({ 'local.email': 'test@test.com' });
    });
  });
  describe('GET /signup', () => {
    it('should have status 200', async () => {
      const res = await request(app)
        .get('/signup');j
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
        .send({ password: 'password', confirm: 'password' });
      assert.isFalse(res.body.success);
    });
    it('should fail with email Abc.example.com', async () => {
      const res = await request(app).post('/signup')
        .send({ email: 'Abc.example.com', password: 'password', confirm: 'password' });
      assert.isFalse(res.body.success);
    });
    it('should fail with email A@b@c@example.com', async () => {
      const res = await request(app)
        .post('/signup')
        .send({ email: 'A@b@c@example.com', password: 'password', confirm: 'password' });
      assert.isFalse(res.body.success);
    });
    it('should fail with email a"b(c)d,e:f;g<h>i[j\k]l@example.com', async () => {
      const res = await request(app)
        .post('/signup')
        .send({ email: 'a"b(c)d,e:f;g<h>i[j\k]l@example.com', password: 'password', confirm: 'password' });
      assert.isFalse(res.body.success);
    });
    it('should fail with email just"not"right@example.com', async () => {
      const res = await request(app)
        .post('/signup')
        .send({ email: 'just"not"right@example.com', password: 'password', confirm: 'password' });
      assert.isFalse(res.body.success);
    });
    it('should fail with email this is"not\allowed@example.com', async () => {
      const res = await request(app)
        .post('/signup')
        .send({ email: 'just"not"right@example.com', password: 'password', confirm: 'password' });
      assert.isFalse(res.body.success);
    });
    it('should fail with email this\ still\"not\\allowed@example.com ', async () => {
      const res = await request(app)
        .post('/signup')
        .send({ email: 'this is"not\allowed@example.com', password: 'password', confirm: 'password' });
      assert.isFalse(res.body.success);
    });
    it('should fail with email 1234567890123456789012345678901234567890123456789012345678901234+x@example.com', async () => {
      const res = await request(app)
        .post('/signup')
        .send({ email: '1234567890123456789012345678901234567890123456789012345678901234+x@example.com', password: 'password', confirm: 'password' });
      assert.isFalse(res.body.success);
    });
    it('should fail with email john..doe@example.com', async () => {
      const res = await request(app)
        .post('/signup')
        .send({ email: 'john..doe@example.com', password: 'password', confirm: 'password' });
      assert.isFalse(res.body.success);
    });
    it('should fail with email john.doe@example..com', async () => {
      const res = await request(app)
        .post('/signup')
        .send({ email: 'john..doe@example.com', password: 'password', confirm: 'password' });
      assert.isFalse(res.body.success);
    });
    it('should fail with password with characters other than a-zA-Z0-9@#$', async () => {
      const res = await request(app)
        .post('/signup')
        .send({ email: 'test@test.com', password: 'password%', confirm: 'password%' });
      assert.isFalse(res.body.success);
    });
    it('should fail with an incorrect confirmation password', async () => {
      const res = await request(app)
        .post('/signup')
        .send({ email: 'test@test.com', password: 'password', confirm: 'password1' });
      assert.isFalse(res.body.success);
    });
    it('should fail with a password shorter than 6 characters', async () => {
      const res = await request(app)
        .post('/signup')
        .send({ email: 'test@test.com', password: 'pass', confirm: 'pass' });
      assert.isFalse(res.body.success);
    });
    it('should fail with a password longer than 20 characters', async () => {
      const res = await request(app)
        .post('/signup')
        .send({ email: 'test@test.com', password: '12345678901234567890a', confirm: '12345678901234567890a' });
      assert.isFalse(res.body.success);
    });
    it('should fail if email is already signed up', async () => {
      const res = await request(app)
        .post('/signup')
        .send({ email: 'test@test.com', password: 'password', confirm: 'password' });
      assert.isFalse(res.body.success);
    });
    it('should succeed with valid email and password', async () => {
      const res = await request(app)
        .post('/signup')
        .send({ email: 'test1@test.com', password: 'password', confirm: 'password' });
      assert.isTrue(res.body.success);
    });
    it('should succeed with valid email and password for business', async () => {
      const res = await request(app)
        .post('/signup')
        .send({ email: 'business@test.com', password: 'password', confirm: 'password', isBusiness: 'on' });
      //      return console.log(res.body);
      assert.isTrue(res.body.success);
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
    let authenticatedSession;
    const testSession = session(app);
    before(async () => {
      await request(app)
        .post('/signup')
        .send({
          email: process.env.TEST_EMAIL,
          password: process.env.TEST_EMAIL_PASS,
          confirm: process.env.TEST_EMAIL_PASS
        });
      await testSession.post('/login')
        .send({
          email: process.env.TEST_EMAIL,
          password: process.env.TEST_EMAIL_PASS
        });
      authenticatedSession = testSession;
    });
    it('should return false if email is invalid', async () => {
      const res = await request(app)
        .post('/forgot')
        .send({ email: 'test#test.com' });
      assert.isFalse(res.body.success);
    });
    it('should return false if no user found', async () => {
      const res = await request(app)
        .post('/forgot')
        .send({ email: 'test@test.com' });
      assert.isFalse(res.body.success);
    });
    it('should return true if email found', async () => {
      const res = await request(app)
        .post('/forgot')
        .send({ email: process.env.TEST_EMAIL });
      assert.isTrue(res.body.success);
    });
    after(async () => {
      await User.findOneAndRemove({ 'local.email': process.env.TEST_EMAIL });
    });
  });
  describe.only('GET /reset/:token', () => {
    before(async () => {
      await request(app)
        .post('/signup')
        .send({
          email: process.env.TEST_EMAIL,
          password: process.env.TEST_EMAIL_PASS,
          confirm: process.env.TEST_EMAIL_PASS
        });
    });
    before(async () => {
      await request(app)
        .post('/forgot')
        .send({
          email: process.env.TEST_EMAIL
        });
    });
    it('should redirect to /forgot if token is invalid', async () => {
      const res = await request(app)
        .get('/reset/incorrecttoken');
      assert.equal(res.header.location, '/forgot');
    });
    it('should have status 200', async () => {
      const res = await request(app)
        .get(`/reset/${process.env.TEST_TOKEN}`);
      assert.equal(res.statusCode, 200);
    });
    after(async () => {
      await User.findOneAndRemove({ 'local.email': process.env.TEST_EMAIL });
    });
  });


          describe('GET /home', () => {
            let authenticatedSession;
            const testSession = session(app);
            it('should create a new user', (done) => {
              request(app).post('/signup').send({ email: 'test@test.com', password: 'password', confirm: 'password' }).end((err, res) => {
                if (err) done(err);
                assert.isTrue(res.body.success);
                done();
              });
            });
            it('should log in', (done) => {
              testSession.post('/login').send({ email: 'test@test.com', password: 'password' }).end((err, res) => {
                if (err) done(err);
                assert.isTrue(res.body.success);
                authenticatedSession = testSession;
                done();
              });
            });
            it('should get home page', (done) => {
              authenticatedSession.get('/home').end((err, res) => {
                if (err) done(err);
                assert.equal(res.statusCode, 200);
                done();
              });
            });
            it('should return false if no user found', (done) => {
              authenticatedSession.post('/forgot').send({ email: 'test1@test.com' }).end((err, res) => {
                if (err) done(err);
                assert.isFalse(res.body.success);
                done();
              });
            });

            it('should delete user account', (done) => {
              authenticatedSession.get('/delete').end((err, res) => {
                if (err) done(err);
                assert.equal(res.headers.location, '/');
                done();
              });
            });
          });

    });
