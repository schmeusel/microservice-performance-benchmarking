import { Interval } from './index';
import { Pattern } from './Pattern';

export default interface ConfigurationSpecification {
	totalPatternRequests: number,
	interval: Interval,
	patterns: Pattern[]
}