import { expect } from 'chai';
import PolyfillUtil from '../../src/utils/PolyfillUtil';

describe('Test PolyfillUtil', () => {
    before(() => {
        PolyfillUtil.initialize();
    });

    describe('String.endsWithInputParam()', () => {
        it('should correctly tell whether a string ends with some sort of input param', () => {
            const correctRes1 = '/users/{userId}'.endsWithInputParam();
            const correctRes2 = '/users/{userId}/hallo/${pet}'.endsWithInputParam();

            const falseRes1 = '/users'.endsWithInputParam();
            const falseRes2 = '/users/{id}/moin'.endsWithInputParam();
            const falseRes3 = '/users/test{id}'.endsWithInputParam();

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
            const str1 = '/hello/test';
            const str2 = 'hello';
            const str3 = '/hello';

            [str1, str2, str3].forEach(string => {
                const result = string.getLastInputParam();
                expect(result).to.be.undefined;
            });
        });

        it('should return the name of the last input param if there is one', () => {
            const str1 = '/hello/test/{testId}';
            const str2 = '/hello/{testId}';
            const str3 = 'hello/{helloId}/test/{testId}';

            [str1, str2, str3].forEach(string => {
                const result = string.getLastInputParam();
                expect(result).to.equal('testId');
            });
        });
    });

    describe('String.getAllInputParams()', () => {
        it('should return an empty array if there are no selectors', () => {
            const str1 = '/hello/test';
            const str2 = 'hello';
            const str3 = '/hello';

            [str1, str2, str3].forEach(string => {
                const result = string.getAllInputParams();
                expect(result).to.deep.equal([]);
            });
        });

        it('should return elements that match a selector', () => {
            const str1 = '/hello/{username}/{id}';
            const str2 = '/users/{username}/events/{id}';
            [str1, str2].forEach((str) => {
                const result = str.getAllInputParams();
                expect(result).to.deep.equal(['username', 'id']);
            });
        })
    });
});
