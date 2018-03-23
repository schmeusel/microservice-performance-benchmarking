import { SLAConditionType } from '../index';

export default interface SLAConditionMeasure {
    value: number;
    unit?: string; // e.g. "ms",
    type: SLAConditionType;
};
