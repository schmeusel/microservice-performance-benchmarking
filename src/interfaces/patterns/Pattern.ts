import { Interval, PatternElement, AbstractPatternElement } from '../index';

export default interface Pattern {
    name: string; // unique
    sequence: PatternElement[] | AbstractPatternElement[];
    interval?: Interval; // optional if "wait" is set in "PatternElement"
    weight: number;
};
