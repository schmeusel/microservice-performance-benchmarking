import { PatternResultMeasurement } from '../index';

export default interface PatternResult {
    name: string;
    measurements: PatternResultMeasurement[];
};
