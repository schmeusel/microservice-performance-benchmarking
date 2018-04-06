import * as winston from 'winston';
import * as fs from 'fs';
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
        return new Promise((resolve, reject) => {
            fs.unlink(config.logging.measurements.filename, error => {
                this._logger = winston.createLogger({
                    transports: [
                        new winston.transports.File({
                            level: 'info',
                            filename: config.logging.measurements.filename,
                            format: winston.format.combine(winston.format.printf(this.withMeasurement))
                        })
                    ],
                    colorize: false,
                    json: false
                });
                this.logMeasurementHeaderLine();
                resolve();
            });
        });
    }

    public addMeasurement(patternRequestMeasurement: PatternRequestMeasurement): void {
        this.logger.log({
            level: 'info',
            measurement: patternRequestMeasurement
        });
    }

    public addMeasurements(patternRequestMeasurements: PatternRequestMeasurement[]): void {
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
        const { measurement } = info;
        if (measurement) {
            return LoggingService.getCSVFields().reduce((logString, propertyName) => {
                return `${!logString ? '' : logString + ','}${measurement[propertyName]}`;
            }, '');
        }
        return info.message;
    }

    private logMeasurementHeaderLine() {
        const header = LoggingService.getCSVFields().join(',');
        console.log('header', header);
        this.logger.info(header);
    }

    private static getCSVFields(): string[] {
        return ['pattern', 'operation', 'timestampStart', 'timestampEnd'];
    }
}

export default new LoggingService();
