import { AbstractPatternElementOperation, PatternElementSelector } from '..';

export default interface AbstractPatternElement {
    id?: string;
    operation: AbstractPatternElementOperation;
    input?: string;
    selector?: PatternElementSelector;
    output: string;
    wait?: number;
};
