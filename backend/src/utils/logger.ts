import winston from 'winston';
import path from 'path';
import fs from 'fs';

const logsDir = path.join(process.cwd(), 'logs');

try {
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
} catch (error) {
  console.error('Failed to create logs directory:', error);
}

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
      return `${timestamp} [${level}]: ${message} ${metaStr}`;
    })
  ),
});

const fileTransports: any[] = [];

try {
  fileTransports.push(
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      format: format,
    })
  );

  fileTransports.push(
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      format: format,
    })
  );
} catch (error) {
  console.error('Failed to create file transports:', error);
}

const logger = winston.createLogger({
  level: 'info',
  format: format,
  defaultMeta: { service: 'coding-club-api' },
  transports: [consoleTransport, ...fileTransports],
  exceptionHandlers: [consoleTransport],
  rejectionHandlers: [consoleTransport],
});

export default logger;