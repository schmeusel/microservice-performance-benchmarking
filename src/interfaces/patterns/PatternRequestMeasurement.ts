import { RequestMethod } from '../index';

export default interface PatternRequestMeasurement {
    status: number;
    method: RequestMethod;
    url: string;
    timestampStart: number;
    timestampEnd: number;
    pattern: string;
};
