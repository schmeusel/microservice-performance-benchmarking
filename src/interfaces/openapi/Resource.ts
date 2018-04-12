import { AbstractPatternElementOperation } from '../index';

export default interface Resource {
    name: string;
    path: string;
    selector?: string;
    operations: AbstractPatternElementOperation[];
    subResources?: Resource[];
};
