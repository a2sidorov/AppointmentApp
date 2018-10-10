'use strict';

const assert = require('chai').assert;
const sinon = require('sinon');
const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'holidayList');
const holidays = require('./holidays');

describe('holidays test', () => {
  describe.skip('fetchData (goolge api request)', () => {
    it('should have status 200', (done) => {
      holidays.fetchData().then((data) => {
        assert.equal(data.status, 200);
        done();
      });
    });
  });
  describe.skip('filterRespone (google api request)', () => {
    it('should only have date and name properties', (done) => {
      holidays.fetchData().then((data) => {
        const filteredData = holidays.filterResponse(data);
        assert.deepEqual(Object.keys(filteredData[0]), ['date', 'name', 'isAvailable']);
        done();
      });
    });
  });
  describe('writeToFile', () => {
    let initialMtimeMs;
    let fakeFetch;
    before((done) => {
      holidays.readFromFile().then((holidaysArray) => {
        fs.stat(filePath, (err, fileStats) => {
          if (err) throw err;
          initialMtimeMs = fileStats.mtimeMs;
          fakeFetch = holidaysArray;
          done();
        });
      });
    });
    it('should have file mtimeMs changed', (done) => {
      holidays.writeToFile(fakeFetch).then(() => {
        fs.stat(filePath, (err, fileStats) => {
          if (err) throw err;
          assert(fileStats.mtimeMs > initialMtimeMs);
          done();
        });
      });
    });
  });
  describe('readFromFile', () => {
    let fileData;
    before((done) => {
      holidays.readFromFile().then((data) => {
        fileData = data;
        done();
      });
    });
    it('should be an array', () => {
      assert.isArray(fileData);
    });
    it('should have date and name properties', () => {
      assert.deepEqual(Object.keys(fileData[0]), ['date', 'name', 'isAvailable']);
    });
  });
});
