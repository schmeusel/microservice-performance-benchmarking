import request from 'request';
import {
    PatternRequest,
    PatternRequestMeasurement,
    RequestMethod,
    AbstractPatternElementOperation
} from '../interfaces/index';
import OpenAPIService from '../services/OpenAPIService';

class PatternRequester {
    private pattern: string;
    private requests: PatternRequest[];
    private requestCount: number;
    private measurements: PatternRequestMeasurement[];

    constructor(pattern: string, requests: PatternRequest[]) {
        this.pattern = pattern;
        this.requests = requests;
        this.measurements = [];
    }

    private asyncLoop(index: number, callback: () => void): void {
        if (index < this.requests.length) {
            const currentRequest: PatternRequest = this.requests[index];
            this.sendRequest(currentRequest, () => {
                setTimeout(() => {
                    this.asyncLoop(index + 1, callback);
                }, currentRequest.wait);
            });
        } else {
            callback();
        }
    }

    private sendRequest(requestToSend: PatternRequest, callback: () => void): void {
        OpenAPIService.sendRequest(requestToSend, (error, res) => {
            const measurement: PatternRequestMeasurement = {
                pattern: this.pattern,
                status: res.status,
                method: RequestMethod.GET, // TODO use real one
                operation: AbstractPatternElementOperation.CREATE, // TODO use real one
                url: 'bla',
                timestampStart: res.timestampStart,
                timestampEnd: res.timestampEnd
            };
            this.addMeasurement(measurement);
            callback();
        });
    }

    public run(callback: () => any): void {
        this.asyncLoop(0, callback);
    }

    private addMeasurement(measurement: PatternRequestMeasurement): void {
        this.measurements.push(measurement);
    }

    public getMeasurements(): PatternRequestMeasurement[] {
        return this.measurements;
    }
}
