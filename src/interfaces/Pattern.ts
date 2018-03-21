import { Interval, PatternElement } from "./index";

export default interface Pattern {
	name: string,
	sequence: PatternElement[],
	interval: Interval
	weight: number,
}