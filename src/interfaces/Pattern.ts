import { Interval, PatternElement } from "./index";

export default interface Pattern {
	name: string, // unique
	sequence: PatternElement[],
	interval?: Interval, // optional if "wait" is set in "PatternElement"
	weight: number,
}