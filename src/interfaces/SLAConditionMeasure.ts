type SLAConditionType = {
	name: "hard" | "soft",
	value?: number // when "name" is "soft", then threshold value required
}

export interface SLAConditionMeasure {
	value: number,
	unit?: string // e.g. "ms",
	type: SLAConditionType
}