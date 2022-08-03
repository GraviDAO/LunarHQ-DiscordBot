import winston, { format } from 'winston';
import  DailyRotateFile from 'winston-daily-rotate-file';

const rotatingArchivingTransport: DailyRotateFile = new DailyRotateFile({
    filename: 'logs/lunarHQ-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d'
  });

const consoleTransport = new winston.transports.Console({ level: 'info' });

module.exports = winston.createLogger({
    transports: [consoleTransport, rotatingArchivingTransport],
    format: format.combine(
        format.colorize(),
        format.timestamp(),
        format.printf(({ timestamp, level, message }) => {
          return `[${timestamp}] ${level}: ${message}`;
        })
      ),
});

/* https://stackoverflow.com/questions/13410754/i-want-to-display-the-file-name-in-the-log-statement
const getLabel = function(callingModule) {
    const parts = callingModule.filename.split(path.sep);
    return path.join(parts[parts.length - 2], parts.pop());
  };
  
  module.exports = function (callingModule) {
    return new winston.Logger({
      transports: [new winston.transports.Console({
        label: getLabel(callingModule)
      })]
    });
  };
*/
/*
export class Logger {
    private logs: object[]
    // Use the `Logger` type
    private static instance: Logger
    // Use a private constructor
    private constructor() {
        this.logs = []
    }
    get count(): number {
        return this.logs.length
    }
    // Ensure that there is only one instance created
    public static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger()
        }        
        return Logger.instance
    }
    log(message: string) {
        const timestamp: string = new Date().toISOString()
        this.logs.push(
            { message, timestamp }
        )
        console.log(`${timestamp} - ${message}`)
    }
}*/