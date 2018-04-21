import {
    Pattern,
    PatternElementRequest,
    PatternResultMeasurement,
    RequestMethod,
    AbstractPatternElementOperation
} from '../interfaces/index';
import OpenAPIService from '../services/OpenAPIService';
import LoggingService from '../services/LoggingService';
import {mapOutputTypeAndMethodToOperation} from '../utils/OpenAPIUtil';

export default class PatternRequester {
    private measurements: PatternResultMeasurement[];
    private pattern: Pattern;
    private requests: PatternElementRequest[];

    constructor(pattern: Pattern, requests: PatternElementRequest[]) {
        this.pattern = pattern;
        this.requests = requests;
        this.measurements = [];
    }

    private asyncLoop(index: number, callback: (any) => void): void {
        if (index < this.requests.length) {
            const currentRequest: PatternElementRequest = this.requests[index];
            this.sendRequest(currentRequest, () => {
                setTimeout(() => {
                    this.asyncLoop(index + 1, callback);
                }, currentRequest.wait);
            });
        } else {
            callback(this.measurements);
        }
    }

    private sendRequest(requestToSend: PatternElementRequest, callback: () => void): void {
        OpenAPIService.sendRequest(requestToSend, (error, res) => {
            if (error) {
                console.log('err', error); // TODO error handling
            }

            const method = res.request.method.toUpperCase() as RequestMethod;
            const outputType = this.pattern.sequence[requestToSend.patternIndex].outputType;
            const measurement: PatternResultMeasurement = {
                pattern: this.pattern.name,
                status: res.statusCode,
                method: method,
                operation: mapOutputTypeAndMethodToOperation(outputType, method)
                url: res.request.uri.href,
                timestampStart: res.timestampStart,
                timestampEnd: res.timestampEnd
            };
            this.addMeasurement(measurement);
            callback();
        });
    }

    public run(callback: (any) => any): void {
        this.asyncLoop(0, callback);
    }

    private addMeasurement(measurement: PatternResultMeasurement): void {
        this.measurements.push(measurement);
        // this.resultCallback(measurement);
        // LoggingService.addMeasurement(measurement);
    }
}
