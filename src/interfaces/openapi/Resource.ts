import { AbstractPatternElementOperation } from '../index';

export default interface Resource {
    name: string;
    path: string;
    accessors?: string[];
    operations: AbstractPatternElementOperation[];
    subResources?: Resource[];
}
