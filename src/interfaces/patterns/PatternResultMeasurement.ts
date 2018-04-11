import { RequestMethod, AbstractPatternElementOperation } from '../index';

export default interface PatternRequestMeasurement {
    status: number;
    method: RequestMethod;
    operation: AbstractPatternElementOperation;
    url: string;
    timestampStart: number;
    timestampEnd: number;
    pattern: string;
};
