import { SLAConditionMeasureBoundary, SLAConditionMeasureType } from '../index';

export default interface SLAConditionMeasure {
    value: number;
    boundary?: SLAConditionMeasureBoundary;
    type: SLAConditionMeasureType;
    tolerance?: number;
}
