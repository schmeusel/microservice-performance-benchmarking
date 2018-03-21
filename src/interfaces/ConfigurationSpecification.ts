import { Pattern } from "./Pattern";
import { Interval } from "./Interval";

export interface ConfigurationSpecification {
	totalPatternRequests: number,
	interval: Interval,
	patterns: Pattern[]
}