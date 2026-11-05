// =========================================================================
// src/config/logger.ts
// Responsible for the centralized application logging.
// Configures Winston with a colorized console output and rotating
// file transports, writing errors and the full history into the logs folder.
// =========================================================================

import winston from 'winston';
import path from 'path';
import fs from 'fs';

const logDir = path.resolve(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL ?? 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, stack }) => {
          const stackString =
            typeof stack === 'string' ? stack : ((stack as { message?: string })?.message ?? '');

          return stack
            ? `[${String(timestamp)}] ${level}: ${message} - ${stackString}`
            : `[${String(timestamp)}] ${level}: ${message}`;
        }),
      ),
      stderrLevels: ['error'],
    }),
    new winston.transports.File({ filename: path.join(logDir, 'error.log'), level: 'error' }),
    new winston.transports.File({ filename: path.join(logDir, 'combined.log') }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.on('error', (err) => {
    console.error('Logger error:', err);
  });
}

export default logger;
