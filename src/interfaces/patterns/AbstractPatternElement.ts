import { AbstractPatternElementOperation, AbstractPatternElementSelector } from '..';

export default interface AbstractPatternElement {
    id?: string;
    operation: AbstractPatternElementOperation;
    input?: string;
    selector?: AbstractPatternElementSelector;
    output: string;
    wait?: number;
};
