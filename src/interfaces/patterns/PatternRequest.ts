import { RequestMethod } from '../index';

export default interface PatternRequest {
    patternIndex: number;
    operationId: string;
    params?: object;
    wait: number;
};
