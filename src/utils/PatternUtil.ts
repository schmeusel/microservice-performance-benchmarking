import { AbstractPatternElementOperation, PatternElementOutputType } from "../interfaces";

export function getOutputTypeFromOperation(operation: AbstractPatternElementOperation) {
    const { SCAN, CREATE, DELETE, READ, UPDATE} = AbstractPatternElementOperation;
    const { LIST, ITEM, NONE} = PatternElementOutputType;
    const objectMapper = {
        [SCAN]: LIST,
        [CREATE]: ITEM,
        [UPDATE]: ITEM,
        [READ]: ITEM,
        [DELETE]: NONE
    };
    return objectMapper[operation];
}
