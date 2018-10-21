'use strict';

const winston = require('winston');
require('winston-daily-rotate-file');

/* Info logger configuration */
const infoFormat = winston.format.printf(info => {
  return `${info.timestamp} ${info.message}`;
});

const infoLog = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    infoFormat
  ),
  transports: new (winston.transports.DailyRotateFile)({
    filename: './logs/info-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '7'
  })
});

/* Error logger configuration */
const errorFormat = winston.format.printf(error => {
  return `${error.timestamp} ${error.message} ${error.stack}`;
});

const errorLog = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    errorFormat
  ),
  transports: new (winston.transports.DailyRotateFile)({
    filename: './logs/error-%DATE%.log',
    zippedArchive: false,
    maxSize: '20m',
    maxFiles: '7',
  })
});

module.exports = {
  'infoLog': infoLog,
  'errorLog': errorLog,
};
