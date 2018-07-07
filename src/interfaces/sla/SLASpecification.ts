import { SLACondition } from '../index';

export default interface SLASpecification {
    [patternName: string]: {
        [sequenceIndex: string]: SLACondition
    }
};
