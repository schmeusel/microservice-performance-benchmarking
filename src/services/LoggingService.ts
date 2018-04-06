import * as winston from 'winston';
import { PatternRequestMeasurement } from '../interfaces/index';
import LoggingError from '../exceptions/LoggingError';
import config from '../config';

class LoggingService {
    private _logger: winston.LoggerInstance;
    private _client: any;
    private _batchSize: number;
    private _measurementCache: PatternRequestMeasurement[];

    public get logger(): winston.LoggerInstance {
        if (!this._logger) {
            throw new LoggingError('LoggingManager has to be initiliazed before logging');
        }
        return this._logger;
    }

    public initialize(batchSize?: number): Promise<void> {
        this._logger = winston.createLogger({
            transports: [
                new winston.transports.File({
                    level: 'info',
                    filename: config.logging.measurements.filename,
                    format: winston.format.combine(winston.format.printf(this.withMeasurement))
                })
                // new winston.transports.Console({
                //     level: 'notice'
                //     // filename: config.logging.systemEvents.filepath,
                // })
            ],
            colorize: false,
            json: false
        });
        this.logMeasurementHeaderLine();

        return Promise.resolve();
    }

    public addMeasurement(patternRequestMeasurement: PatternRequestMeasurement): void {
        this.logger.log({
            level: 'info',
            measurement: patternRequestMeasurement
        });
    }

    public addMeasurements(patternRequestMeasurements: PatternRequestMeasurement[]): void {
        console.log('loggin measurements');
        patternRequestMeasurements.forEach(measurement => {
            this.logger.log({
                level: 'info',
                measurement
            });
        });
    }

    public log(options: object) {
        this.logger.log(options);
    }

    private withMeasurement(info) {
        const { measurement } = <{ measurement: PatternRequestMeasurement }>info;
        if (measurement) {
            return LoggingService.getCSVFields().reduce((logString, propertyName) => {
                return `${logString},${measurement[propertyName]}`;
            });
        }
        return info.message;
    }

    private logMeasurementHeaderLine() {
        this.logger.info(LoggingService.getCSVFields().join(','));
    }

    private static getCSVFields(): string[] {
        return ['pattern', 'operation', 'timestampStart', 'timestampEnd'];
    }
}

export default new LoggingService();
