import { PatternElementSelector, PatternElementOutputType, Resource } from '..';

export default interface PatternElement {
    operationId: string;
    wait: number;
    input?: string;
    output?: string;
    outputType?: PatternElementOutputType;
    selector?: PatternElementSelector;
    resource?: Resource;
};
