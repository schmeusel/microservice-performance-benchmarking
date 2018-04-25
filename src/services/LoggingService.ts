import * as winston from 'winston';
import * as fs from 'fs';
import { PatternResultMeasurement, PatternElementRequest, Pattern } from '../interfaces/index';
import LoggingError from '../exceptions/LoggingError';
import config from '../config';
import { format } from 'util';

class LoggingService {
    private _eventLogger: winston.LoggerInstance;
    private _measurementLogger: winston.LoggerInstance;

    public get eventLogger(): winston.LoggerInstance {
        if (!this._eventLogger) {
            throw new LoggingError('LoggingManager has to be initiliazed before using the event logger.');
        }
        return this._eventLogger;
    }

    public get measurementLogger(): winston.LoggerInstance {
        if (!this._measurementLogger) {
            throw new LoggingError('LoggingManager has to be initiliazed before using the event logger.');
        }
        return this._measurementLogger;
    }

    /**
     * Clean up previous log files and create logging transport to file as described in config.
     * Also, for the log file, print the header line depicting the structure of the CSV file.
     */
    public initialize(): Promise<any> {
        return Promise.all([this.initializeEventLogger(), this.initializeMeasurementLogger()]);
    }

    public initializeMeasurementLogger(): Promise<void> {
        return new Promise((resolve, reject) => {
            fs.unlink(config.logging.measurements.filename, () => {
                this._measurementLogger = winston.createLogger({
                    transports: [
                        new winston.transports.File({
                            level: 'info',
                            filename: config.logging.measurements.filename,
                            format: winston.format.combine(winston.format.printf(this.withMeasurement))
                        })
                    ]
                });
                this.logMeasurementHeaderLine();
                resolve();
            });
        });
    }

    private initializeEventLogger(): Promise<void> {
        return new Promise((resolve, reject) => {
            fs.unlink(config.logging.systemEvents.filename, () => {
                this._eventLogger = winston.createLogger({
                    transports: [
                        new winston.transports.File({
                            level: 'info',
                            filename: config.logging.systemEvents.filename,
                            format: winston.format.combine(winston.format.timestamp(), winston.format.printf(this.withTimestamp))
                        })
                    ]
                });
                resolve();
            });
        });
    }

    public initializeWorkloadLoggers(patterns: Pattern[]): Promise<any> {
        return Promise.all(patterns.map(pattern => this.initializeWorkloadLogger(pattern)));
    }

    private initializeWorkloadLogger(pattern: Pattern): Promise<void> {
        return new Promise((resolve, reject) => {
            fs.unlink(config.logging.workloads.filename(pattern.name), () => {
                this[`_${pattern.name}Logger`] = winston.createLogger({
                    transports: [
                        new winston.transports.File({
                            level: 'info',
                            filename: config.logging.workloads.filename(pattern.name),
                            format: winston.format.combine(winston.format.printf(this.withPatternRequest))
                        })
                    ]
                });
                resolve();
            });
        });
    }

    public addMeasurements(patternRequestMeasurements: PatternResultMeasurement[]): void {
        patternRequestMeasurements.forEach(measurement => {
            this.measurementLogger.log({
                level: 'info',
                measurement
            });
        });
    }

    public saveGeneratedRequests(patternRequests: PatternElementRequest[]): void {
        if (!patternRequests.length) {
            throw new LoggingError('saveGeneratedRequests was called with an empty array.');
        }
        patternRequests.forEach((patternRequest, i) => {
            this[`_${patternRequest.patternName}Logger`].log({
                level: 'info',
                request: patternRequest
            });

            // Log the delimiter after the last one
            if (i === patternRequests.length - 1) {
                this[`_${patternRequest.patternName}Logger`].log({
                    level: 'info',
                    message: config.logging.workloads.delimiter
                });
            }
        });
    }

    public logEvent(message: string): void {
        this.eventLogger.log({
            level: 'info',
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
        if (measurement) {
            return LoggingService.getMeasurementString(measurement);
        }
        return info.message;
    }

    private withPatternRequest(info): string {
        const { request } = info;
        if (request) {
            return LoggingService.getPatternRequestString(request);
        }
        return info.message;
    }

    private logMeasurementHeaderLine(): void {
        const header = LoggingService.getMeasurementCSVFields().join(',');
        this.measurementLogger.info(header);
    }

    private static getMeasurementCSVFields(): string[] {
        return ['pattern', 'operation', 'timestampStart', 'timestampEnd'];
    }

    private static getMeasurementString(measurement: PatternResultMeasurement): string {
        return LoggingService.getMeasurementCSVFields().reduce((logString, propertyName) => {
            return `${!logString ? '' : logString + ','}${measurement[propertyName]}`;
        }, '');
    }

    private static getPatternRequestString(request: PatternElementRequest): string {
        return JSON.stringify(request);
    }
}

export default new LoggingService();
