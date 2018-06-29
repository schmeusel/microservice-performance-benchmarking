import { expect } from 'chai';
import { buildNewOutputs } from "../../src/utils/RequestUtil";
import { PatternElementOutputType } from "../../src/interfaces";
const {ITEM, LIST} = PatternElementOutputType;

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
});
