import winston, { format, createLogger, transports, LoggerInstance } from 'winston';
import { PatternRequestMeasurement } from '../interfaces/index';
import LoggingError from '../exceptions/LoggingError';
import config from '../config';

class LoggingService {
    private _logger: LoggerInstance;
    private _client: any;
    private _batchSize: number;
    private _measurementCache: PatternRequestMeasurement[];

    public get logger(): LoggerInstance {
        if (!this._logger) {
            throw new LoggingError('LoggingManager has to be initiliazed before logging');
        }
        return this._logger;
    }

    public initialize(batchSize?: number): Promise<void> {
        this._logger = createLogger({
            transports: [
                new transports.File({
                    level: 'info',
                    filename: config.logging.measurements.filepath,
                    formatter: (info, options) => this.withMeasurement(info, options)
                }),
                new transports.Console({
                    level: 'notice'
                    // filename: config.logging.systemEvents.filepath,
                })
            ],
            colorize: false,
            json: false
        });

        return Promise.resolve();
    }

    public addMeasurement(patternRequestMeasurement: PatternRequestMeasurement): void {
        this.logger.log({
            level: 'info',
            measurement: patternRequestMeasurement
        });
    }

    public log(options: object) {
        this.logger.log(options);
    }

    private withMeasurement(info, options) {
        const { measurement } = <{ measurement: PatternRequestMeasurement }>info.measurement;
        if (measurement) {
            info.message = `${measurement.pattern},${measurement.operation},${measurement.timestampStart},${
                measurement.timestampEnd
            }`;
        }
        return info.message;
    }
}

export default new LoggingService();
