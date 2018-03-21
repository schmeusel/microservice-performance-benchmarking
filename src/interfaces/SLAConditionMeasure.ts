import { SLAConditionType } from ".";

export default interface SLAConditionMeasure {
	value: number,
	unit?: string // e.g. "ms",
	type: SLAConditionType
}