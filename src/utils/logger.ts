import winston from "winston";

const { combine, timestamp, colorize, printf } = winston.format;

const baseOptionslogger = (moduleName?: string) => ({
  level: "debug",

  format: combine(
    colorize({ all: true }),

    timestamp({
      format: "YYYY-MM-DD hh:mm:ss.SSS A",
    }),
    printf((info) =>
      moduleName
        ? `[${info.timestamp}]  ${info.level}:[${moduleName}]:  ${info.message}`
        : `[${info.timestamp}]  ${info.level}:   ${info.message}`
    )
  ),

  transports: [new winston.transports.Console({})],
  exitOnError: true,
});

export const logger = winston.createLogger(baseOptionslogger());
export const createLoggingMoudule = (module: string) =>
  winston.loggers.add(module, baseOptionslogger(module));
