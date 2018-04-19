import { Interval, PatternElement, AbstractPatternElement } from '../index';

export default interface Pattern {
    name: string;
    sequence: PatternElement[];
    weight: number;
}
