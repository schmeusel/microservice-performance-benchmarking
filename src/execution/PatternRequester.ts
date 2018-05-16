import {
    Pattern,
    PatternElementRequest,
    PatternRequestMeasurement,
    RequestMethod,
    AbstractPatternElementOperation,
    PatternResult,
    PatternElementOutputType,
    PatternElementSelector
} from '../interfaces/index';
import OpenAPIService from '../services/OpenAPIService';
import { mapOutputTypeAndMethodToOperation } from '../utils/OpenAPIUtil';
import * as winston from 'winston';

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
        if (!existingOutputData) {
            throw new Error(`There is no previous output stored for input: ${inputName}`);
        }
        const outputType = this.getOutputType(inputName);
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
            return this.enrichRequestWithInputItem(request, inputItem);
        }
        if (outputType === PatternElementOutputType.ITEM) {
            return this.enrichRequestWithInputItem(request, existingOutputData);
        }
        throw new Error(`Cannot process a NONE output as an input for another request.`);
    }

    private enrichRequestWithInputItem(request: PatternElementRequest, inputItem): PatternElementRequest {
        const paramKeys = Object.keys(request.parameters);
        const requestBodyKeys = Object.keys(request.requestBody);
        const inputItemKeys = Object.keys(inputItem);
        const idKey = inputItemKeys.find(this.findIdKey);

        if (!idKey) {
            throw new Error('Could not locate identifying key from input. Input keys are: ' + JSON.stringify(inputItemKeys));
        }

        // Look for suitable key in parameters
        const paramKeyToBeReplaced = paramKeys.find(this.findIdKey);
        if (paramKeyToBeReplaced) {
            return {
                ...request,
                parameters: {
                    ...request.parameters,
                    [paramKeyToBeReplaced]: inputItem[idKey]
                }
            }
        }

        // Look for suitable key in requestBody
        const requestBodyKeyToBeReplaced = requestBodyKeys.find(this.findIdKey);
        return {
            ...request,
            requestBody: {
                ...request.requestBody,
                [requestBodyKeyToBeReplaced || idKey]: inputItem[idKey]
            }
        }

        // throw new Error('Could not locate identifying key from parameters or request body. Parameter keys are: ' + JSON.stringify(paramKeys) + ". Request body keys: " + JSON.stringify(requestBodyKeys));

    }

    private findIdKey(key: string) {
        const lowercaseKey = key.toLowerCase();
        return lowercaseKey === 'id' || lowercaseKey.startsWith('id') || lowercaseKey.endsWith('id');
    }

    private getOutputType(outputName: string): PatternElementOutputType {
        const sequenceElement = this.pattern.sequence.find(el => el.output === outputName);
        if (!sequenceElement) {
            throw new Error(`No sequence element found for name: ${outputName}`);
        }
        return sequenceElement.outputType;
    }

    private sendRequest(requestToSend: PatternElementRequest): Promise<void> {
        return new Promise((resolve, reject) => {
            OpenAPIService.sendRequest(requestToSend)
                .then(response => {
                    const method = response.request.method.toUpperCase() as RequestMethod;
                    const outputType = this.pattern.sequence[requestToSend.patternIndex].outputType;

                    const processableResponse = typeof response === "string" ? JSON.parse(response) : response;

                    const measurement: PatternRequestMeasurement = {
                        pattern: this.pattern.name,
                        status: processableResponse.statusCode,
                        method: method,
                        operation: mapOutputTypeAndMethodToOperation(outputType, method),
                        url: processableResponse.request.uri.href,
                        timestampStart: processableResponse.timestampStart,
                        timestampEnd: processableResponse.timestampEnd,
                        round: requestToSend.round,
                        patternIndex: requestToSend.patternIndex
                    };

                    this.addMeasurement(measurement);
                    if (this.pattern.sequence[requestToSend.patternIndex].output) {
                        this._outputs[this.pattern.sequence[requestToSend.patternIndex].output] = typeof processableResponse.body === 'string' ? JSON.parse(response.body) : response.body;
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
