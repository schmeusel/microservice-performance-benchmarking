import { expect } from 'chai';
import PolyfillUtil from '../../src/utils/PolyfillUtil';

describe('Test PolyfillUtil', () => {
    before(() => {
        PolyfillUtil.initialize();
    });

    describe('String.endsWithInputParam()', () => {
        it('should correctly tell whether a string ends with some sort of input param', () => {
            const correctRes1 = '/users/${userId}'.endsWithInputParam();
            const correctRes2 = '/users/${userId}/hallo/${pet}'.endsWithInputParam();

            const falseRes1 = '/users'.endsWithInputParam();
            const falseRes2 = '/users/${id}/moin'.endsWithInputParam();
            const falseRes3 = '/users/test${id}'.endsWithInputParam();

            [correctRes1, correctRes2].forEach(result => {
                expect(result).to.be.true;
            });

            [falseRes1, falseRes2].forEach(result => {
                expect(result).to.be.false;
            });
        });
    });

    describe('String.getLastInputParam()', () => {
        it('should return undefined if no input param found', () => {
            const res1 = '/hello/test'.getLastInputParam();
            const res2 = 'hello'.getLastInputParam();
            const res3 = '/hello'.getLastInputParam();

            [res1, res2, res3].forEach(result => {
                expect(result).to.be.undefined;
            });
        });

        it('should return the name of the last input param if there is one', () => {
            const res1 = '/hello/test/${testId}';
            const res2 = '/hello/{testId}';
            const res3 = 'hello/${helloId}/test/${testId}';

            [res1, res2, res3].forEach(result => {
                expect(result).to.equal('testId');
            });
        });
    });
});
