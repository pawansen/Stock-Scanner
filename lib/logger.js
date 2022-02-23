 /**
 * Configurations of logger.
 */
const winston = require('winston');
const winstonRotator = require('winston-daily-rotate-file');
const appRoot =  require('app-root-path');

const logger = winston.createLogger({
    transports: [
        new winston.transports.DailyRotateFile ({
            filename: 'logs-%DATE%.log',
            dirname: `${appRoot}/logs/`,
            handleExceptions: true,
            colorize: true,
            json: false,
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d'        
        })
    ],
    exitOnError: false
});

module.exports = {'log': logger};