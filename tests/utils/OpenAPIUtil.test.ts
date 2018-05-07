import { expect } from 'chai';

import { mapHttpMethodToElementOperation } from '../../src/utils/OpenAPIUtil';
import PolyfillUtil from '../../src/utils/PolyfillUtil';
import { RequestMethod, AbstractPatternElementOperation } from '../../src/interfaces';

describe('Test OpenAPIUtil', () => {
    before(() => {
        PolyfillUtil.initialize();
    });

    describe('mapHttpMethodToElementOperation(...)', () => {
        it('should map correct methods and paths to abstract operation elements', () => {
            const pathMock = '/users/{userId}';

            const putResult = mapHttpMethodToElementOperation(pathMock, 'put');
            const postResult = mapHttpMethodToElementOperation(pathMock, 'post');
            const deleteResult = mapHttpMethodToElementOperation(pathMock, 'delete');
            expect(putResult).to.equal(AbstractPatternElementOperation.UPDATE);
            expect(postResult).to.equal(AbstractPatternElementOperation.CREATE);
            expect(deleteResult).to.equal(AbstractPatternElementOperation.DELETE);
        });

        it('should be able to differentiate between READ and SCAN depending on the path', () => {
            const readPath = '/users/{id}';
            const getResult = mapHttpMethodToElementOperation(readPath, 'get');

            const scanPath = '/users';
            const scanResult = mapHttpMethodToElementOperation(scanPath, 'get');

            expect(getResult).to.equal(AbstractPatternElementOperation.READ);
            expect(scanResult).to.equal(AbstractPatternElementOperation.SCAN);
        });
        it('should return undefined if no valid method has been passed as an argument', () => {
            const path = '/users';
            const res1 = mapHttpMethodToElementOperation(path, 'kas');
            const res2 = mapHttpMethodToElementOperation(path, null);
            const res3 = mapHttpMethodToElementOperation(path, undefined);
            [res1, res2, res3].forEach(result => {
                expect(result).to.be.undefined;
            });
        });
        it('should return undefined if no valid path has been passed as an argument', () => {
            const method = 'get';
            const res1 = mapHttpMethodToElementOperation(null, method);
            const res2 = mapHttpMethodToElementOperation(undefined, method);
            const res3 = mapHttpMethodToElementOperation('users', method);
        });
    });
});
