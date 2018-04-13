import { Interval, PatternElement, AbstractPatternElement } from '../index';

export default interface Pattern {
    name: string; // unique
    sequence: PatternElement[];
    weight: number;
};
