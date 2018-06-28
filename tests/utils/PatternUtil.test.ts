import { expect } from 'chai';
import { getOutputTypeFromOperation } from "../../src/utils/PatternUtil";
import { AbstractPatternElementOperation, PatternElementOutputType } from "../../src/interfaces";

const { SCAN, DELETE, UPDATE, READ, CREATE } = AbstractPatternElementOperation;
const { ITEM, LIST, NONE } = PatternElementOutputType;


describe('Test PatternUtil', () => {
    describe('getOutputTypeFromOperation(...)', () => {
        it('should return LIST for a SCAN operation', () => {
            const result = getOutputTypeFromOperation(SCAN);
            expect(result).to.equal(LIST);
        });

        it('should return NONE for a DELETE operation', () => {
            const result = getOutputTypeFromOperation(DELETE);
            expect(result).to.equal(NONE);
        });

        it('should return ITEM for CREATE, UPDATE, READ operations', () => {
            [CREATE, UPDATE, READ].forEach(op => {
                const result = getOutputTypeFromOperation(op);
                expect(result).to.equal(ITEM);
            });
        });
    });
});
