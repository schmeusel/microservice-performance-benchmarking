import { PatternElement } from '../index';

export default interface Pattern {
    name: string;
    sequence: PatternElement[];
    amount: number;
}
