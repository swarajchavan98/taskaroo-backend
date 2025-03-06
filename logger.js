// logger.js
const { createLogger, format, transports } = require('winston');

const logger = createLogger({
  level: 'info', // Log level (info, warn, error)
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // Add timestamp
    format.printf(({ timestamp, level, message }) => {
      return `${timestamp} ${level.toUpperCase()}: ${message}`;
    })
  ),
  transports: [
    new transports.Console(), // Log to console
    new transports.File({ filename: 'app.log' }) // Log to file
  ],
});

module.exports = logger;
