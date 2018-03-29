import { expect } from 'chai';
import PolyfillUtil from '../../src/utils/PolyfillUtil';

describe('TestSuite for PolyfillUtil', () => {
    before(() => {
        PolyfillUtil.initialize();
    });

    describe('String.endsWithInputParam', () => {
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
});
