import { PatternElementSelector, PatternElementOutputType } from '..';

export default interface PatternElement {
    operationId: string;
    wait: number;
    input?: string;
    output?: string;
    outputType?: PatternElementOutputType;
    selector?: PatternElementSelector;
    // possible information about required parameters (e.g. key range)
};
