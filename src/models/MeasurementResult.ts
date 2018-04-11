import { PatternResultMeasurement, RequestMethod, AbstractPatternElementOperation } from '../interfaces/index';
import MeasurementResultError from '../exceptions/MeasurementResultError';
import LoggingService from '../services/LoggingService';

export default class MeasurementResult implements PatternResultMeasurement {
    status: number;
    method: RequestMethod;
    operation: AbstractPatternElementOperation;
    url: string;
    timestampStart: number;
    timestampEnd: number;
    pattern: string;

    constructor(measurement: PatternResultMeasurement) {
        this.status = measurement.status;
        this.method = measurement.method;
        this.operation = measurement.operation;
        this.url = measurement.url;
        this.timestampStart = measurement.timestampStart;
        this.timestampEnd = measurement.timestampEnd;
        this.pattern = measurement.pattern;

        const anyNotSet = [
            this.status,
            this.method,
            this.operation,
            this.url,
            this.timestampStart,
            this.timestampEnd,
            this.pattern
        ].reduce((anyFaulty, curr) => anyFaulty || !curr, false);
        if (anyNotSet) {
            throw new MeasurementResultError(`Measurement is not valid. ${measurement}`);
        }
    }

    public save() {
        // TODO
    }
}
