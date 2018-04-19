import { AbstractPatternElement, Interval } from '..';

export default interface AbstractPattern {
    name: string;
    sequence: AbstractPatternElement[];
    interval?: Interval;
    weight: number;
}
