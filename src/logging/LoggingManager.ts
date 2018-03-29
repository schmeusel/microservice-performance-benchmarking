import { createLogger, LoggerInstance, format, transports } from 'winston';
import * as winston from 'winston';
import { PatternRequestMeasurement } from '../interfaces/index';
import { LoggingError } from '../exceptions/index';

class LoggingManager {
    private _logger: LoggerInstance;
    private _client: any;
    private _batchSize: number;
    private _measurementCache: PatternRequestMeasurement[];

    public get logger(): LoggerInstance {
        if (!this._logger) {
            throw new LoggingError('StorageManager has to be initiliazed before logging');
        }
        return this._logger;
    }

    public initialize(batchSize?: number): void {
        this._logger = winston.createLogger({
            transports: [new transports.File({ filename: '../../logs/measurements.log' })]
        });
    }

    public addMeasurement(patternRequestMeasurement: PatternRequestMeasurement): void {
        this.logger;
    }

    public log(options: object) {
        this.logger.log(options);
    }
}

export default new LoggingManager();
