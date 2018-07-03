import { expect } from 'chai';
import { buildNewOutputs, getInputItemFromList } from "../../src/utils/RequestUtil";
import { PatternElementOutputType, PatternElementSelector } from "../../src/interfaces";

const { ITEM, LIST } = PatternElementOutputType;

describe('Test RequestUtil', () => {
    describe('buildNewOutputs(...)', () => {
        it('should return the same output if no outputName was provided', () => {
            const stubOutputs = 'fake';
            const result = buildNewOutputs(undefined, ITEM, stubOutputs, {});
            expect(result).to.equal(stubOutputs);
        });

        it('should merge new output into existing structure', () => {
            const outputNameStub = 'newEntry';
            const valueStub = 1;
            const outputStub = {
                ['test']: {
                    [LIST]: valueStub
                },
                [outputNameStub]: {
                    [LIST]: valueStub
                },
            };
            const responseStub = {
                body: valueStub
            };

            const expectedOutput = {
                ['test']: {
                    [LIST]: valueStub
                },
                [outputNameStub]: {
                    [LIST]: valueStub,
                    [ITEM]: valueStub
                }
            };

            const result = buildNewOutputs(outputNameStub, ITEM, outputStub, responseStub);
            expect(result).to.deep.equal(expectedOutput);
        })
    });

    describe('getInputItemFromList(...)', () => {
        it('should thrown an error if outputList is not an array', () => {
            expect(() => getInputItemFromList(null, null)).to.throw();
        });

        it('should return an empty object if array is empty', () => {
            const result = getInputItemFromList(null, []);
            expect(result).to.deep.equal({});
        });

        it('should return the first element from the array if the selector is FIRST', () => {
            const sequenceElementStub = { selector: PatternElementSelector.FIRST } as any;
            const result = getInputItemFromList(sequenceElementStub, [1, 2, 3]);
            expect(result).to.equal(1);
        });

        it('should return the last element from the array if the selector is LAST', () => {
            const sequenceElementStub = { selector: PatternElementSelector.LAST } as any;
            const result = getInputItemFromList(sequenceElementStub, [1, 2, 3]);
            expect(result).to.equal(3);
        });

        it('should return any element from the array if the selector is RANDOM', () => {
            const sequenceElementStub = { selector: PatternElementSelector.LAST } as any;
            const result = getInputItemFromList(sequenceElementStub, [1, 2, 3]);
            expect(result).to.be.within(1, 3);
        });
    })
});
