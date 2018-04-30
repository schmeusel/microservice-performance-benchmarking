import {
    Pattern,
    PatternElementRequest,
    PatternResultMeasurement,
    RequestMethod,
    AbstractPatternElementOperation
} from '../interfaces/index';
import OpenAPIService from '../services/OpenAPIService';
import LoggingService from '../services/LoggingService';
import { mapOutputTypeAndMethodToOperation } from '../utils/OpenAPIUtil';
import * as winston from 'winston';

export default class PatternRequester {
    private measurements: PatternResultMeasurement[];
    private pattern: Pattern;
    private requests: PatternElementRequest[];
    private _eventLogger;

    constructor(pattern: Pattern, requests: PatternElementRequest[]) {
        this.pattern = pattern;
        this.requests = requests;
        this.measurements = [];

        this._eventLogger = winston.createLogger({
            transports: [
                new winston.transports.File({
                    filename: 'requester.log'
                })
            ]
        });
    }

    private asyncLoop(index: number, resolve: (measurementResults: PatternResultMeasurement[]) => void, reject): void {
        if (index < this.requests.length) {
            const currentRequest: PatternElementRequest = this.requests[index];
            this.sendRequest(currentRequest)
                .then(() => {
                    setTimeout(() => {
                        this.asyncLoop(index + 1, resolve, reject);
                    }, currentRequest.wait);
                })
                .catch(reject);
        } else {
            resolve(this.measurements);
        }
    }

    private sendRequest(requestToSend: PatternElementRequest): Promise<void> {
        this._eventLogger.info('sending a request');
        return new Promise((resolve, reject) => {
            OpenAPIService.sendRequest(requestToSend)
                .then(response => {
                    const method = response.request.method.toUpperCase() as RequestMethod;
                    const outputType = this.pattern.sequence[requestToSend.patternIndex].outputType;
                    const measurement: PatternResultMeasurement = {
                        pattern: this.pattern.name,
                        status: response.statusCode,
                        method: method,
                        operation: mapOutputTypeAndMethodToOperation(outputType, method),
                        url: response.request.uri.href,
                        timestampStart: response.timestampStart,
                        timestampEnd: response.timestampEnd,
                        round: requestToSend.round
                    };
                    this._eventLogger.info('adding to measurements');
                    this.addMeasurement(measurement);
                    resolve();
                })
                .catch(err => {
                    // TODO gather information from err
                    const measurement: PatternResultMeasurement = {
                        pattern: this.pattern.name,
                        status: 400,
                        method: RequestMethod.GET,
                        operation: AbstractPatternElementOperation.SCAN,
                        url: 'test',
                        timestampStart: 1,
                        timestampEnd: 300,
                        round: requestToSend.round
                    };
                    this._eventLogger.info('adding error to measurements');
                    this.addMeasurement(measurement);
                    resolve();
                });
        });
    }

    public run(): Promise<PatternResultMeasurement[]> {
        return new Promise((resolve, reject) => {
            this.asyncLoop(0, resolve, reject);
        });
    }

    private addMeasurement(measurement: PatternResultMeasurement): void {
        this.measurements.push(measurement);
    }
}
