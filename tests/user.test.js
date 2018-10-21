'use strict';

/* User model test */

const assert = require('chai').assert;
const expect = require('chai').expect;
//const mongoose = require('mongoose');
const User = require('../models/user');

describe('User model test', () => {

  describe('email validation', () => {
    it('should be invalid if email is empty', (done) => {
      const newUser = new User();
      newUser.local.username = 'test';
      newUser.local.password = '21321214';
      newUser.validate((err) => {
        expect(err.errors['local.email']).to.exist;
        done();
        
      });
    });
    it('should be invalid if no @ character', (done) => {
      const newUser = new User();
      newUser.local.username = 'test';
      newUser.local.password = '21321214';
      newUser.local.email = 'Abc.example.com';
      newUser.validate((err) => {
        expect(err.errors['local.email']).to.exist;
        done();
      });
    });
    it('should be invalid if more than one @ character', (done) => {
      const newUser = new User();
      newUser.local.username = 'test';
      newUser.local.password = '21321214';
      newUser.local.email = 'A@b@c@example.com';
      newUser.validate((err) => {
        expect(err.errors['local.email']).to.exist;
        done();
      });
    });
    it('should be invalid if it has special outside quotation marks', (done) => {
      const newUser = new User();
      newUser.local.username = 'test';
      newUser.local.password = '21321214';
      newUser.local.email = 'a"b(c)d,e:f;g<h>i[j\k]l@example.com';
      newUser.validate((err) => {
        expect(err.errors['local.email']).to.exist;
        done();
      });
    });
    it('should be invalid if it has quoted strings without dot separation', (done) => {
      const newUser = new User();
      newUser.local.username = 'test';
      newUser.local.password = '21321214';
      newUser.local.email = 'just"not"right@example.com';
      newUser.validate((err) => {
        expect(err.errors['local.email']).to.exist;
        done();
      });
    });
    it('should be invalid if it has escaped spaces, quotes, and backslashes outside quotation marks', (done) => {
      const newUser = new User();
      newUser.local.username = 'test';
      newUser.local.password = '21321214';
      newUser.local.email = 'this\ still\"not\\allowed@example.com';
      newUser.validate((err) => {
        expect(err.errors['local.email']).to.exist;
        done();
      });
    });
    it('should be invalid if it has local part is longer than 64 characters', (done) => {
      const newUser = new User();
      newUser.local.username = 'test';
      newUser.local.password = '21321214';
      newUser.local.email = '1234567890123456789012345678901234567890123456789012345678901234+x@example.com';
      newUser.validate((err) => {
        expect(err.errors['local.email']).to.exist;
        done();
      });
    });
    it('should be invalid if it has double dot before @', (done) => {
      const newUser = new User();
      newUser.local.username = 'test';
      newUser.local.password = '21321214';
      newUser.local.email = 'ohn..doe@example.com';
      newUser.validate((err) => {
        expect(err.errors['local.email']).to.exist;
        done();
      });
    });
    it('should be invalid if it has double dot after @', (done) => {
      const newUser = new User();
      newUser.local.username = 'test';
      newUser.local.password = '21321214';
      newUser.local.email = 'john.doe@example..com';
      newUser.validate((err) => {
        expect(err.errors['local.email']).to.exist;
        done();
      });
    });

    it('should be valid if email is ok', (done) => {
      const newUser = new User();
      newUser.local.username = 'username';
      newUser.local.password = 'password';
      newUser.local.email = 'foo@bar.com';
      newUser.validate((err) => {
        expect(err).to.not.exist;
        done();
      });
    });
  });
  /*
  describe('password validation', () => {
    it('should be invalid if it is empty', (done) => {
      const newUser = new User();
      newUser.local.email = 'test@test.com';
      newUser.validate((err) => {
        assert.exists(err.errors['local.password']);
        done();
      });
    });
    it('should be invalid if it is under 6 characters', (done) => {
      const newUser = new User();
      newUser.local.email = 'test@test.com';
      newUser.local.password = '12a';
      newUser.validate((err) => {
        assert.exists(err.errors['local.password']);
        done();
      });
    });
    it('should be invalid if is is above 20 characters', (done) => {
      const newUser = new User();
      newUser.local.email = 'test@test.com';
      newUser.local.password = '12345678901234567890a';
      newUser.validate((err) => {
        assert.exists(err.errors['local.password']);
        done();
      });
    });
    it('should be invalid if it has no letters', (done) => {
      const newUser = new User();
      newUser.local.email = 'test@test.com';
      newUser.local.password = '123456';
      newUser.validate((err) => {
        assert.exists(err.errors['local.password']);
        done();
      });
    });
    it('should be invalid if it has a white space ( #qwerty)', (done) => {
      const newUser = new User();
      newUser.local.email = 'test@test.com';
      newUser.local.password = ' #qwerty';
      newUser.validate((err) => {
        assert.exists(err.errors['local.password']);
        done();
      });
    });
    it('should be invalid if it has a white space (#qwerty )', (done) => {
      const newUser = new User();
      newUser.local.email = 'test@test.com';
      newUser.local.password = '#qwerty ';
      newUser.validate((err) => {
        assert.exists(err.errors['local.password']);
        done();
      });
    });
    it('should be invalid if it has a white space (#qwe rty)', (done) => {
      const newUser = new User();
      newUser.local.email = 'test@test.com';
      newUser.local.password = '#qwe rty';
      newUser.validate((err) => {
        assert.exists(err.errors['local.password']);
        done();
      });
    });

    it('should be valid, case: qwerty', (done) => {
      const newUser = new User();
      newUser.local.email = 'test@test.com';
      newUser.local.password = 'qwerty';
      newUser.validate((err) => {
        assert.notExists(err);
        done();
      });
    });
    it('should be valid, case qwerty@', (done) => {
      const newUser = new User();
      newUser.local.email = 'test@test.com';
      newUser.local.password = 'qwerty@';
      newUser.validate((err) => {
        assert.notExists(err);
        done();
      });
    });
    it('should be valid, case qwe$rty', (done) => {
      const newUser = new User();
      newUser.local.email = 'test@test.com';
      newUser.local.password = 'qwe$rty';
      newUser.validate((err) => {
        assert.notExists(err);
        done();
      });
    });
    it('should be valid, case #qwerty', (done) => {
      const newUser = new User();
      newUser.local.email = 'test@test.com';
      newUser.local.password = '#qwerty';
      newUser.validate((err) => {
        assert.notExists(err);
        done();
      });
    });
  });
  */
  describe('firstname validation', () => {
    it('should be valid if it is empty', (done) => {
      const newUser = new User();
      newUser.local.email = 'test@test.com';
      newUser.local.password = 'password';
      newUser.validate((err) => {
        expect(err).to.not.exist;
        done();
      });
    });
    it('should be invalid if it has other than these characters [a-zA-Z0-9@#$]', (done) => {
      const newUser = new User();
      newUser.local.email = 'test@test.com';
      newUser.local.password = 'password';
      newUser.firstname = 'pass/word';
      newUser.validate((err) => {
        expect(err.errors.firstname).to.exist;
        done();
      });
    });
    it('should be invalid if it has more than 20 characters', (done) => {
      const newUser = new User();
      newUser.local.email = 'test@test.com';
      newUser.local.password = 'password';
      newUser.firstname = '12345678901234567890a';
      newUser.validate((err) => {
        expect(err.errors.firstname).to.exist;
        done();
      });
    });
    it('should be invalid if it has a whitespace', (done) => {
      const newUser = new User();
      newUser.local.email = 'test@test.com';
      newUser.local.password = 'password';
      newUser.firstname = ' firstname';
      newUser.validate((err) => {
        expect(err.errors.firstname).to.exist;
        done();
      });
    });
  });
  describe('lastname validation', () => {
    it('should be valid if it is empty', (done) => {
      const newUser = new User();
      newUser.local.email = 'test@test.com';
      newUser.local.password = 'password';
      newUser.validate((err) => {
        expect(err).to.not.exist;
        done();
      });
    });
    it('should be invalid if it has other than these characters [a-zA-Z0-9@#$]', (done) => {
      const newUser = new User();
      newUser.local.email = 'test@test.com';
      newUser.local.password = 'password';
      newUser.lastname = 'last/name';
      newUser.validate((err) => {
        expect(err.errors.lastname).to.exist;
        done();
      });
    });
    it('should be invalid if it has more than 20 characters', (done) => {
      const newUser = new User();
      newUser.local.email = 'test@test.com';
      newUser.local.password = 'password';
      newUser.lastname = '12345678901234567890a';
      newUser.validate((err) => {
        expect(err.errors.lastname).to.exist;
        done();
      });
    });
    it('should be invalid if it has a whitespace', (done) => {
      const newUser = new User();
      newUser.local.email = 'test@test.com';
      newUser.local.password = 'password ';
      newUser.lastname = 'lastname ';
      newUser.validate((err) => {
        expect(err.errors.lastname).to.exist;
        done();
      });
    });
  });
  describe('contacts test', () => {
    it('should be an array', (done) => {
      const newUser = new User();
      newUser.local.email = 'test@test.com';
      newUser.local.password = 'password';
      assert.isArray(newUser.contacts);
      done();
    });
    it('should be an empty array', (done) => {
      const newUser = new User();
      newUser.local.email = 'test@test.com';
      newUser.local.password = 'password';
      assert(newUser.contacts.length === 0);
      done();
    });
  });
  describe('appointments test', () => {
    it('should exist', (done) => {
      const newUser = new User();
      newUser.local.email = 'test@test.com';
      newUser.local.password = 'password';
      expect(newUser.appointments).to.exist;
      done();
    });
    it('should be an array', (done) => {
      const newUser = new User();
      newUser.local.email = 'test@test.com';
      newUser.local.password = 'password';
      assert.isArray(newUser.appointments);
      done();
    });
    it('should be an empty array', (done) => {
      const newUser = new User();
      newUser.local.email = 'test@test.com';
      newUser.local.password = 'password';
      assert(newUser.appointments.length === 0);
      done();
    });
  });
  describe('generateHash test', () => {
    it('should exist', (done) => {
      const newUser = new User();
      newUser.local.email = 'test@test.com';
      newUser.local.password = 'password';
      expect(newUser.generateHash(newUser.local.password)).to.exist;
      done();
    });
    it('should be a string', (done) => {
      const newUser = new User();
      newUser.local.email = 'test@test.com';
      newUser.local.password = 'password';
      assert.isString(newUser.generateHash(newUser.local.password));
      done();
    });
    it('should be an empty array', (done) => {
      const newUser = new User();
      newUser.local.email = 'test@test.com';
      newUser.local.password = 'password';
      assert.notEqual(newUser.local.password, newUser.generateHash(newUser.local.password));
      done();
    });
  });
  describe('validPassword test', () => {
    it('should be true if hashed passwords are equal', (done) => {
      const newUser = new User();
      newUser.local.email = 'test@test.com';
      newUser.local.password = newUser.generateHash('password');
      assert.isTrue(newUser.validPassword('password'));
      done();
    });
    it('should be false if hashed passwords are not equal', (done) => {
      const newUser = new User();
      newUser.local.email = 'test@test.com';
      newUser.local.password = newUser.generateHash('password');
      assert.isFalse(newUser.validPassword('Password'));
      done();
    });
  });
});







