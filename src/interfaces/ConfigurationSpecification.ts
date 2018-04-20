import { AbstractPattern } from './index';

export default interface ConfigurationSpecification {
    totalPatternRequests: number;
    patterns: AbstractPattern[];
}
