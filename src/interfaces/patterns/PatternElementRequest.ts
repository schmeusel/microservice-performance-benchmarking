import { RequestMethod } from '../index';

export default interface PatternElementRequest {
    patternName: string;
    patternIndex: number;
    operationId: string;
    params?: object;
    wait: number;
}
