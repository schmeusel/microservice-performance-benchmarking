import { SLAConditionMeasure } from '../index';

export default interface SLACondition {
    min?: SLAConditionMeasure;
    max?: SLAConditionMeasure;
    mean?: SLAConditionMeasure; // TODO upper or lower boundary
    stdev?: SLAConditionMeasure; // TODO upper or lower boundary
    // add percentiles
};
