import * as winston from 'winston';
import * as fs from 'fs';
import { PatternRequestMeasurement } from '../interfaces/index';
import LoggingError from '../exceptions/LoggingError';
import config from '../config';
import { format } from 'util';

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
            fs.unlink(config.logging.measurements.filename, () => {
                this._logger = winston.createLogger({
                    transports: [
                        new winston.transports.File({
                            level: 'info',
                            filename: config.logging.measurements.filename,
                            format: winston.format.combine(winston.format.printf(this.withMeasurement))
                        }),
                        new winston.transports.Console({
                            level: 'debug',
                            filename: config.logging.systemEvents.filename,
                            format: winston.format.combine(
                                this.ignoreInfo(),
                                winston.format.timestamp(),
                                winston.format.printf(this.withTimestamp)
                            )
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

    public log(message: string): void {
        this.logger.log({
            level: 'debug',
            message
        });
    }

    private withTimestamp(info): string {
        if (info.timestamp) {
            return `[${info.timestamp}] ${info.message}`;
        }
        return info;
    }

    private withMeasurement(info): string {
        const { measurement } = info;
        let returnString = '';
        if (measurement) {
            return LoggingService.getMeasurementString(measurement);
        }
        return info.message;
    }

    private logMeasurementHeaderLine(): void {
        const header = LoggingService.getCSVFields().join(',');
        this.logger.info(header);
    }

    private static getCSVFields(): string[] {
        return ['pattern', 'operation', 'timestampStart', 'timestampEnd'];
    }

    private static getMeasurementString(measurement: PatternRequestMeasurement): string {
        return LoggingService.getCSVFields().reduce((logString, propertyName) => {
            return `${!logString ? '' : logString + ','}${measurement[propertyName]}`;
        }, '');
    }

    private ignoreInfo() {
        return winston.format((info, options) => {
            if (info.level === 'info') {
                return false;
            }
            return info;
        })();
    }
}

export default new LoggingService();
