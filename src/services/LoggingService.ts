import * as winston from 'winston';
import * as fse from 'fs-extra';
import { PatternRequestMeasurement, PatternElementRequest, Pattern, PatternResult } from '../interfaces/index';
import LoggingError from '../exceptions/LoggingError';
import config from '../config';

export class LoggingService {
    private _eventLogger: winston.Logger;
    private _measurementLogger: winston.Logger

    public get eventLogger(): winston.Logger{
        if (!this._eventLogger) {
            throw new LoggingError('LoggingManager has to be initiliazed before using the event logger.');
        }
        return this._eventLogger;
    }

    public get measurementLogger(): winston.Logger {
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
        return new Promise((resolve, reject) => {
            this.deletePreviousLogs()
                .then(() => this.createLoggingDirectories())
                .then(() => {
                    this.initializeEventLogger();
                    this.initializeMeasurementLogger();
                    resolve();
                })
                .catch(reject);
        });
    }

    private deletePreviousLogs(): Promise<void> {
        return fse.remove(config.logging.directory);
    }

    private createLoggingDirectories(): Promise<void> {
        return fse.ensureDir(config.logging.loggers.workloads.directory);
    }

    public initializeMeasurementLogger(): void {
        this._measurementLogger = winston.createLogger({
            transports: [
                new winston.transports.File({
                    level: 'info',
                    filename: config.logging.loggers.measurements.filename,
                    format: winston.format.combine(winston.format.printf(this.withMeasurement))
                })
            ]
        });
        this.logMeasurementHeaderLine();
    }

    private initializeEventLogger(): void {
        this._eventLogger = winston.createLogger({
            transports: [
                new winston.transports.File({
                    level: 'info',
                    filename: config.logging.loggers.systemEvents.filename,
                    format: winston.format.combine(winston.format.timestamp(), winston.format.printf(this.withTimestamp))
                })
            ]
        });
    }

    public initializeWorkloadLoggers(patterns: Pattern[]): void {
        patterns.forEach(pattern => this.initializeWorkloadLogger(pattern));
    }

    private initializeWorkloadLogger(pattern: Pattern): void {
        this[`_${pattern.name}Logger`] = winston.createLogger({
            transports: [
                new winston.transports.File({
                    level: 'info',
                    filename: config.logging.loggers.workloads.filename(pattern.name),
                    format: winston.format.combine(winston.format.printf(this.withPatternRequest))
                })
            ]
        });
    }

    public addPatternResult(patternResult: PatternResult): void {
        patternResult.measurements.forEach(measurement => {
            this.measurementLogger.log({
                level: 'info',
                message: '',
                measurement
            });
        });
    }

    public saveGeneratedRequests(patternRequests: PatternElementRequest[]): void {
        if (!patternRequests.length) {
            throw new LoggingError('saveGeneratedRequests was called with an empty array.');
        }
        patternRequests.forEach(patternRequest => {
            this[`_${patternRequest.patternName}Logger`].log({
                level: 'info',
                request: patternRequest
            });
        });
    }

    public logEvent(message: string): void {
        console.log(`[${new Date(Date.now()).toISOString()}] ${message}`);
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

    public static getMeasurementCSVFields(): string[] {
        return ['pattern', 'operation', 'timestampStart', 'timestampEnd', 'status', 'url', 'patternIndex', 'round'];
    }

    private static getMeasurementString(measurement: PatternRequestMeasurement): string {
        return LoggingService.getMeasurementCSVFields().reduce((logString, propertyName) => {
            return `${!logString ? '' : logString + ','}${measurement[propertyName]}`;
        }, '');
    }

    private static getPatternRequestString(request: PatternElementRequest): string {
        return JSON.stringify(request);
    }
}

export default new LoggingService();
