import { Pattern, PatternElementRequest, PatternResultMeasurement, RequestMethod, AbstractPatternElementOperation } from '../interfaces/index';
import OpenAPIService from '../services/OpenAPIService';
import LoggingService from '../services/LoggingService';
import { mapOutputTypeAndMethodToOperation } from '../utils/OpenAPIUtil';

export default class PatternRequester {
    private measurements: PatternResultMeasurement[];
    private pattern: Pattern;
    private requests: PatternElementRequest[];

    constructor(pattern: Pattern, requests: PatternElementRequest[]) {
        this.pattern = pattern;
        this.requests = requests;
        this.measurements = [];
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
                .catch(err => {
                    reject(err);
                });
        } else {
            resolve(this.measurements);
        }
    }

    private sendRequest(requestToSend: PatternElementRequest): Promise<void> {
        return new Promise((resolve, reject) => {
            OpenAPIService.sendRequest(requestToSend, (error, res) => {
                if (error) {
                    reject(error);
                    return;
                }

                const method = res.request.method.toUpperCase() as RequestMethod;
                const outputType = this.pattern.sequence[requestToSend.patternIndex].outputType;
                const measurement: PatternResultMeasurement = {
                    pattern: this.pattern.name,
                    status: res.statusCode,
                    method: method,
                    operation: mapOutputTypeAndMethodToOperation(outputType, method),
                    url: res.request.uri.href,
                    timestampStart: res.timestampStart,
                    timestampEnd: res.timestampEnd
                };
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
