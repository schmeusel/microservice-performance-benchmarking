import {
    Pattern,
    PatternElementRequest,
    PatternRequestMeasurement,
    PatternResult,
    PatternElementOutputType,
    PatternElementSelector
} from '../interfaces/index';
import OpenAPIService from '../services/OpenAPIService';
import { mapOutputTypeAndMethodToOperation } from '../utils/OpenAPIUtil';
import * as winston from 'winston';
import { enrichRequestWithInputItem, getBodyFromResponse, getOutputType, getProcessableResponse, getRequestMethodFromResponse, getRequestUrlFromResponse, getStatusCode } from "../utils/RequestUtil";

export default class PatternRequester {
    private readonly measurements: PatternRequestMeasurement[];
    private readonly pattern: Pattern;
    private readonly requests: PatternElementRequest[];
    private readonly _outputs: { [outputName: string]: any };
    private _eventLogger;

    constructor(pattern: Pattern, requests: PatternElementRequest[]) {
        this._outputs = {};
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

    private log(message: string) {
        this._eventLogger.log({ level: 'info', message });
    }

    private asyncLoop(index: number, resolve: (patternResult: PatternResult) => void, reject): void {
        if (index < this.requests.length) {
            const currentRequest: PatternElementRequest = this.enrichRequestWithInput(this.requests[index]);
            this.sendRequest(currentRequest)
                .then(() => {
                    setTimeout(() => {
                        this.asyncLoop(index + 1, resolve, reject);
                    }, currentRequest.wait);
                })
                .catch(err => {
                    this.log('catching in async loop')
                    reject(err)
                });
        } else {
            const patternResult: PatternResult = {
                name: this.pattern.name,
                measurements: this.measurements
            };
            resolve(patternResult);
        }
    }

    private enrichRequestWithInput(request: PatternElementRequest): PatternElementRequest {
        const matchingSequenceElement = this.pattern.sequence[request.patternIndex];
        const inputName: string = matchingSequenceElement.input;
        if (!inputName) {
            return request;
        }
        const existingOutputData = this._outputs[inputName];
        if (!existingOutputData) {
            throw new Error(`There is no previous output stored for input: ${inputName}`);
        }
        const outputType = getOutputType(inputName, this.pattern);
        if (outputType === PatternElementOutputType.LIST) {
            if (!Array.isArray(existingOutputData)) {
                throw new Error(`Output data for a list item is not an array.`);
            }
            let inputItem;
            switch (matchingSequenceElement.selector) {
                case PatternElementSelector.FIRST: {
                    inputItem = existingOutputData.shift();
                    break;
                }
                case PatternElementSelector.LAST: {
                    inputItem = existingOutputData.pop();
                    break;
                }
                case PatternElementSelector.RANDOM:
                default: {
                    // TODO length validation
                    const randomIndex = Math.round(Math.random() * existingOutputData.length - 1);
                    inputItem = existingOutputData[randomIndex];
                }
            }
            return enrichRequestWithInputItem(request, inputItem, OpenAPIService.getSelectorsForOperationId(request.operationId));
        }
        if (outputType === PatternElementOutputType.ITEM) {
            return enrichRequestWithInputItem(request, existingOutputData, OpenAPIService.getSelectorsForOperationId(request.operationId));
        }
        throw new Error(`Cannot process a NONE output as an input for another request.`);
    }



    private sendRequest(requestToSend: PatternElementRequest): Promise<void> {
        this.log('about to send request: ' + JSON.stringify(requestToSend))
        return new Promise((resolve, reject) => {
            OpenAPIService.sendRequest(requestToSend)
                .then(response => {
                    const method = getRequestMethodFromResponse(response);
                    const outputType = this.pattern.sequence[requestToSend.patternIndex].outputType;

                    const processableResponse = getProcessableResponse(response);

                    const measurement: PatternRequestMeasurement = {
                        pattern: this.pattern.name,
                        status: getStatusCode(processableResponse),
                        method: method,
                        operation: mapOutputTypeAndMethodToOperation(outputType, method),
                        url: getRequestUrlFromResponse(processableResponse),
                        timestampStart: processableResponse.timestampStart,
                        timestampEnd: processableResponse.timestampEnd,
                        round: requestToSend.round,
                        patternIndex: requestToSend.patternIndex
                    };

                    this.addMeasurement(measurement);
                    if (this.pattern.sequence[requestToSend.patternIndex].output) {
                        const outputKey = this.pattern.sequence[requestToSend.patternIndex].output;
                        this._outputs[outputKey] = getBodyFromResponse(response);
                    }
                    resolve();
                })
                .catch(reject);
        });
    }

    public run(): Promise<PatternResult> {
        return new Promise((resolve, reject) => {
            this.asyncLoop(0, resolve, reject);
        });
    }

    private addMeasurement(measurement: PatternRequestMeasurement): void {
        this.measurements.push(measurement);
    }
}
