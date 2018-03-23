import { AbstractPatternElement } from '../index';

export default interface AbstractPattern {
    name: string;
    sequence: AbstractPatternElement[];
};
