import { RequestMethod } from '../index';

export default interface PatternElementRequest {
    patternIndex: number;
    operationId: string;
    params?: object;
    wait: number;
};
