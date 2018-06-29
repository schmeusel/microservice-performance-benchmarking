import {
    Pattern,
    PatternElementRequest,
    PatternRequestMeasurement,
    PatternResult,
    PatternElementOutputType,
} from '../interfaces/index';
import OpenAPIService from '../services/OpenAPIService';
import { mapOutputTypeAndMethodToOperation } from '../utils/OpenAPIUtil';
import * as winston from 'winston';
import { buildNewOutputs, enrichRequestWithInputItem, getBodyFromResponse, getInputItemFromList, getOutputType, getProcessableResponse, getRequestMethodFromResponse, getRequestUrlFromResponse, getStatusCode } from "../utils/RequestUtil";

export default class PatternRequester {
    private readonly measurements: PatternRequestMeasurement[];
    private readonly pattern: Pattern;
    private readonly requests: PatternElementRequest[];
    private _outputs: {
        [outputName: string]: any
    };
    private _eventLogger: winston.Logger;

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
                .catch(reject);
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
        const outputTypeFromDependency = getOutputType(inputName, this.pattern);
        const { LIST, ITEM } = PatternElementOutputType;

        if (outputTypeFromDependency === LIST) {
            const inputItem = getInputItemFromList(matchingSequenceElement, existingOutputData[LIST]);
            this._outputs[inputName][ITEM] = inputItem;
            return enrichRequestWithInputItem(request, inputItem, OpenAPIService.getSelectorsForOperationId(request.operationId));
        }
        if (outputTypeFromDependency === ITEM) {
            return enrichRequestWithInputItem(request, existingOutputData[ITEM], OpenAPIService.getSelectorsForOperationId(request.operationId));
        }
        throw new Error(`Cannot process a "NONE" output as an input for another request.`);
    }



    private sendRequest(requestToSend: PatternElementRequest): Promise<void> {
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
                    const providedOutputKey = this.pattern.sequence[requestToSend.patternIndex].output;
                    this._outputs = buildNewOutputs(providedOutputKey, outputType, this._outputs, response);
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
