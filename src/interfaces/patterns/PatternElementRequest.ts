import { RequestMethod } from '../index';

export default interface PatternElementRequest {
    patternName: string;
    patternIndex: number;
    operationId: string;
    parameters?: object;
    wait: number;
    round: number;
}
