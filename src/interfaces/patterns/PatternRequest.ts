import { RequestMethod } from '../index';

export default interface PatternRequest {
    url: string;
    method: RequestMethod;
    auth?: object;
    headers?: object;
    body?: object;
    patternIndex: number;
    operationId: string;
    params: object;
    wait: number;
};
