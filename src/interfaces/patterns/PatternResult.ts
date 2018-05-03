import { PatternRequestMeasurement } from '../index';

export default interface PatternResult {
    name: string;
    measurements: PatternRequestMeasurement[];
}
