import { AbstractPatternElementOperation, PatternElementSelector, Resource } from '..';

export default interface AbstractPatternElement {
    id?: string;
    operation: AbstractPatternElementOperation;
    input?: string;
    selector?: PatternElementSelector;
    output?: string;
    wait?: number;
}

export interface AbstractPatternElementExtended extends AbstractPatternElement {
    index?: number;
    resource?: Resource;
}
