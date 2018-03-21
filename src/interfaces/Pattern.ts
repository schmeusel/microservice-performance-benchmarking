import { PatternElement } from "./PatternElement";

export interface Pattern {
	name: string,
	sequence: PatternElement[],
	weight: number,
}