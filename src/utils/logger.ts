import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const { combine, timestamp, colorize, printf, simple } = winston.format;

const baseOptionslogger = (moduleName?: string) => ({
  level: 'info',
  transports: [
    new winston.transports.Console({
      format: combine(
        colorize({ all: true }),
        timestamp({
          format: 'YYYY-MM-DD hh:mm:ss.SSS A'
        }),
        printf(info => {
          return moduleName
            ? `[${info.timestamp}]  ${info.level}:[${moduleName}]${info['prefix'] ? ':' + info['prefix'] : ''}: ${
                info.message
              }`
            : `[${info.timestamp}]  ${info.level}:   ${info.message}`;
        })
      )
    })
    // fileDebugRotateTransport(moduleName),
    // fileErrorRotateTransport(moduleName),
  ],
  exitOnError: true
});

const fileErrorRotateTransport = (moduleName?: string) =>
  new DailyRotateFile({
    level: 'error',
    filename: 'src/public/logs/application-error-%DATE%.log',
    format: combine(simple()),
    datePattern: 'YYYY-MM-DD-HH',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d'
  });

const fileDebugRotateTransport = (moduleName?: string) =>
  new DailyRotateFile({
    level: 'debug',
    filename: 'src/public/logs/application-debug-%DATE%.log',

    format: combine(
      timestamp({
        format: 'YYYY-MM-DD hh:mm:ss.SSS A'
      }),
      printf(info =>
        moduleName
          ? `[${info.timestamp}]  ${info.level}:[${moduleName}]:  ${info.message}`
          : `[${info.timestamp}]  ${info.level}:   ${info.message}`
      )
    ),
    datePattern: 'YYYY-MM-DD-HH',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d'
  });

export const logger = winston.createLogger(baseOptionslogger());
export const createLoggingMoudule = (module: string) => winston.loggers.add(module, baseOptionslogger(module));
