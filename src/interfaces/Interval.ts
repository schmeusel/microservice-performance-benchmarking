type Distribution = "uniform" | "normal";

export interface Interval {
	distribution: Distribution,
	params: {
		fix?: number,
		stdev?: number,
		mean?: number,
	},
}