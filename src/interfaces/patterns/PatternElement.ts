import { PatternElementSelector } from './PatternElementSelector';

export default interface PatternElement {
    operationId: string;
    wait: number;
    input?: string;
    output?: string;
    selector?: PatternElementSelector;
    // possible information about required parameters (e.g. key range)
    // dependency declaration between input <-> output of pattern element operations
};
