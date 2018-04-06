import * as winston from 'winston';
import * as fs from 'fs';
import { PatternRequestMeasurement } from '../interfaces/index';
import LoggingError from '../exceptions/LoggingError';
import config from '../config';

class LoggingService {
    private _logger: winston.LoggerInstance;

    public get logger(): winston.LoggerInstance {
        if (!this._logger) {
            throw new LoggingError('LoggingManager has to be initiliazed before logging');
        }
        return this._logger;
    }

    /**
     * Clean up previous log files and create logging transport to file as described in config.
     * Also, for the log file, print the header line depicting the structure of the CSV file.
     */
    public initialize(): Promise<void> {
        return new Promise((resolve, reject) => {
            // Remove previous log file and ignore errors (e.g. file did not exist before)
            fs.unlink(config.logging.measurements.filename, () => {
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

    public addMeasurements(patternRequestMeasurements: PatternRequestMeasurement[]): void {
        patternRequestMeasurements.forEach(measurement => {
            this.logger.log({
                level: 'info',
                measurement
            });
        });
    }

    public log(options: object): void {
        this.logger.log(options);
    }

    private withMeasurement(info): string {
        const { measurement } = info;
        if (measurement) {
            return LoggingService.getCSVFields().reduce((logString, propertyName) => {
                return `${!logString ? '' : logString + ','}${measurement[propertyName]}`;
            }, '');
        }
        return info.message;
    }

    private logMeasurementHeaderLine(): void {
        const header = LoggingService.getCSVFields().join(',');
        console.log('header', header);
        this.logger.info(header);
    }

    private static getCSVFields(): string[] {
        return ['pattern', 'operation', 'timestampStart', 'timestampEnd'];
    }
}

export default new LoggingService();
