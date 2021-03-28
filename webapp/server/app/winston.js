const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, prettyPrint, printf} = format;

const myFormat = printf(({ level, message, service, timestamp }) => {
  return `${timestamp} [${service}] ${level}: ${message}`;
});

const logger = createLogger({
    level: 'info',
    format: combine(
      timestamp(),
      myFormat
    ),
    transports: [
      new transports.File({ filename: '/home/ubuntu/server/server.log' }),
    ],
});

module.exports = logger;