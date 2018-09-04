'use strict';

const winston = require('winston')
const { createLogger, format, transports } = winston
const { combine, simple, json, colorize } = format

 const logger = createLogger({
  format: format.combine(
    format.simple()
  ),
  transports: [
    new transports.Console({
      format: combine(
        colorize(),
        simple()
      )
    }),
  ]
})

if (process.env.NODE_ENV === 'production') {
  logger.add(new winston.transports.File({
    level: 'info',
    format: json(),
    filename: './logs/app.log',
  }));
  logger.add(new winston.transports.File({
    level: 'error',
    format: json(),
    filename: './logs/error.log',
  }));
}

logger.stream = {
  write: function(message, encoding) {
    logger.info(message);
  },
};

module.exports = logger;
