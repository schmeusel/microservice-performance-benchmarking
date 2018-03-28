import { AbstractPatternElementOperation } from '../index';

export default interface Resource {
    name: string;
    path: string;
    operations: AbstractPatternElementOperation[];
    subResources?: Resource[];
};
