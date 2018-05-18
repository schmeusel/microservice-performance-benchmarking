import { AbstractPatternElementOperation, PatternElementSelector, Resource } from '..';

export default interface AbstractPatternElement {
    operationId?: string; // identifier in the OpenAPI spec file
    id?: string; // mapping ID to specify a resource in the customization object
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
