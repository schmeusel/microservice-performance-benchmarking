import { SLAConditionMeasure } from "./index";

export default interface SLACondition {
	min?: SLAConditionMeasure,
	max?: SLAConditionMeasure,
	mean?: SLAConditionMeasure,
	stdev?: SLAConditionMeasure,
	// add percentiles
}