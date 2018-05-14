import { Pattern, PatternElementRequest, PatternRequestMeasurement, RequestMethod, AbstractPatternElementOperation, PatternResult, PatternElementOutputType, PatternElementSelector } from '../interfaces/index';
import OpenAPIService from '../services/OpenAPIService';
import { mapOutputTypeAndMethodToOperation } from '../utils/OpenAPIUtil';
import * as winston from 'winston';

export default class PatternRequester {
    private measurements: PatternRequestMeasurement[];
    private pattern: Pattern;
    private requests: PatternElementRequest[];
    private _eventLogger;
    private _outputs: { [outputName: string]: any };

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
        const findIdKey = k => {
            const key = k.toLowerCase();
            return key === 'id' || key.startsWith('id') || key.endsWith('id');
        };
        const paramKeys = Object.keys(request.parameters);
        const inputItemKeys = Object.keys(inputItem);
        const idKey = inputItemKeys.find(findIdKey);
        if (!idKey) {
            throw new Error('Could not locate identifying key from input.');
        }
        const paramKeyToBeReplaced = paramKeys.find(findIdKey);
        if (!paramKeyToBeReplaced) {
            throw new Error('Could not locate identifying key from parameters.');
        }
        return {
            ...request,
            parameters: {
                ...request.parameters,
                [paramKeyToBeReplaced]: inputItem[idKey]
            }
        }
    }

    private getOutputType(outputName: string): PatternElementOutputType {
        const sequenceElement = this.pattern.sequence.find(el => el.output === outputName);
        if (!sequenceElement) {
            this._eventLogger.info(`No sequence element found for name: ${outputName}`);
            throw new Error(`No sequence element found for name: ${outputName}`);
        }
        return sequenceElement.outputType;
    }

    private sendRequest(requestToSend: PatternElementRequest): Promise<void> {
        this._eventLogger.info('sending a request');
        return new Promise((resolve, reject) => {
            OpenAPIService.sendRequest(requestToSend)
                .then(response => {
                    const method = response.request.method.toUpperCase() as RequestMethod;
                    const outputType = this.pattern.sequence[requestToSend.patternIndex].outputType;
                    const measurement: PatternRequestMeasurement = {
                        pattern: this.pattern.name,
                        status: response.statusCode,
                        method: method,
                        operation: mapOutputTypeAndMethodToOperation(outputType, method),
                        url: response.request.uri.href,
                        timestampStart: response.timestampStart,
                        timestampEnd: response.timestampEnd,
                        round: requestToSend.round,
                        patternIndex: requestToSend.patternIndex
                    };
                    this._eventLogger.info('adding to measurements');
                    this.addMeasurement(measurement);
                    this._eventLogger(`response ${JSON.stringify(response)}' `)
                    this._outputs[this.pattern.sequence[requestToSend.patternIndex].output] = response.body;
                    resolve();
                })
                .catch(err => {
                    // TODO gather information from err
                    const measurement: PatternRequestMeasurement = {
                        pattern: this.pattern.name,
                        status: 400,
                        method: RequestMethod.GET,
                        operation: AbstractPatternElementOperation.SCAN,
                        url: 'test',
                        timestampStart: 1,
                        timestampEnd: 300,
                        round: requestToSend.round,
                        patternIndex: requestToSend.patternIndex
                    };
                    this._eventLogger.info('adding error to measurements');
                    this.addMeasurement(measurement);
                    resolve();
                });
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
