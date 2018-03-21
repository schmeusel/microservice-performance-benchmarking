import { Interval, Pattern } from './index';

export default interface ConfigurationSpecification {
	totalPatternRequests: number,
	interval: Interval,
	patterns: Pattern[]
}