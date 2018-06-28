import { expect } from 'chai';

import {
    doesOperationIdExist,
    getAccessorsForResource, getOperationObjectByOperationId,
    getOperationsForResource, getPathForOperationId, getTopLevelResourcePaths,
    mapHttpMethodToElementOperation
} from '../../src/utils/OpenAPIUtil';
import PolyfillUtil from '../../src/utils/PolyfillUtil';
import { RequestMethod, AbstractPatternElementOperation } from '../../src/interfaces';

const { SCAN, CREATE, READ, UPDATE, DELETE } = AbstractPatternElementOperation;


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
            [res1, res2, res3].forEach(res => {
                expect(res).to.be.undefined;
            })
        });
    });

    describe('getAccessorsForResource(...)', () => {
        const openAPISpecStub = {
            paths: {
                '/users/{username}': {},
                '/orders/{orderId}/events/{id}': {},
                '/store': {}
            }
        } as any;

        it('should one accessors if the resource has one', () => {
            const result = getAccessorsForResource('/users', openAPISpecStub);
            expect(result).to.deep.equal(['username']);
        });

        it('should return an empty array if the resource has no accessor', () => {
            const result = getAccessorsForResource('/store', openAPISpecStub);
            expect(result).to.deep.equal([]);
        });

        it('should return multiple accessors in the correct order', () => {
            const result = getAccessorsForResource('/orders/{orderId}/events', openAPISpecStub);
            expect(result).to.deep.equal(['orderId', 'id']);
        });
    });

    describe('getOperationsForResource(...)', () => {
        const openAPISpecStub = {
            paths: {
                '/users': {
                    get: {}
                },
                '/users/{username}': {
                    get: {},
                    put: {}
                },
                '/orders/{orderId}/events/{id}': {
                    put: {},
                    delete: {},
                },
                '/store': {
                    get: {}
                },
                '/pets': {},
                '/dogs/{id}': {
                    get: {},
                    delete: {},
                },
            }
        } as any;

        it('should return SCAN for resources without accessors and GET as HTTP verb', () => {
            const result = getOperationsForResource('/store', openAPISpecStub);
            expect(result).to.have.length(1);
            expect(result).to.include.members([SCAN]);
        });

        it('should return list all HTTP verbs for resources with accessors', () => {
            const result = getOperationsForResource('/dogs', openAPISpecStub);
            expect(result).to.have.length(2);
            expect(result).to.include.members([READ, DELETE]);
        });

        it('should find all available operations even by combining paths and accessors', () => {
            const result = getOperationsForResource('/users', openAPISpecStub);
            expect(result).to.have.length(3);
            expect(result).to.include.members([SCAN, READ, UPDATE]);
        });

        it('should return an empty array if no operations are available', () => {
            const result = getOperationsForResource('/pets', openAPISpecStub);
            expect(result).to.deep.equal([]);
        });

        it('should return operations for a sub resource path', () => {
            const result = getOperationsForResource('/orders/{orderId}/events', openAPISpecStub);
            expect(result).to.have.length(2);
            expect(result).to.include.members([UPDATE, DELETE]);
        });
    });

    describe('getPathForOperationId(...)', () => {
        const openAPISpecStub = {
            paths: {
                '/users': {
                    get: { operationId: 'listUsers' }
                },
                '/users/{username}': {
                    get: { operationId: 'readUser' },
                    put: { operationId: 'updateUser' },
                },
                '/store': {
                    get: { operationId: 'listStore' },
                },
            }
        } as any;

        it('should return throw an error if no path has an operation object that contains the given operationId', () => {
            expect(() => getPathForOperationId('test', openAPISpecStub)).to.throw();
        });

        it('should return the respective path if any of its objects matches with the operationId', () => {
            const userListResult = getPathForOperationId('listUsers', openAPISpecStub);
            expect(userListResult).to.equal('/users');

            const userUpdateResult = getPathForOperationId('updateUser', openAPISpecStub);
            expect(userUpdateResult).to.equal('/users/{username}');
        });
    });

    describe('getOperationObjectByOperationId(...)', () => {
        const openAPISpecStub = {
            paths: {
                '/users': {
                    get: { operationId: 'listUsers' }
                },
                '/users/{username}': {
                    get: { operationId: 'readUser' },
                    put: { operationId: 'updateUser' },
                },
            }
        } as any;

        it('should return undefined if no operation object contains the given operationId', () => {
            const result = getOperationObjectByOperationId('test', openAPISpecStub);
            expect(result).to.be.undefined;
        });

        it('should return the operation object that matches the given operationId', () => {
            const userListResult = getOperationObjectByOperationId('listUsers', openAPISpecStub);
            expect(userListResult).to.deep.equal({ operationId: 'listUsers' });

            const userUpdateResult = getOperationObjectByOperationId('updateUser', openAPISpecStub);
            expect(userUpdateResult).to.deep.equal({ operationId: 'updateUser' });
        });
    });

    describe('getTopLevelResourcePaths(...)', () => {
        const openAPISpecStub = {
            paths: {
                '/users': {
                    get: { operationId: 'listUsers' }
                },
                '/users/{username}': {
                    get: { operationId: 'readUser' },
                    put: { operationId: 'updateUser' },
                },
                '/store': {
                    get: { operationId: 'listStore' },
                },
            }
        } as any;

        it('should return all top level paths', () => {
            const result = getTopLevelResourcePaths(openAPISpecStub);
            expect(result).to.have.length(2);
            expect(result).to.include.members(['/users', '/store']);
        });
    });

    describe('doesOperationIdExist(...)', () => {
        const openAPISpecStub = {
            paths: {
                '/users': {
                    get: { operationId: 'listUsers' }
                },
                '/users/{username}': {
                    get: { operationId: 'readUser' },
                    put: { operationId: 'updateUser' },
                },
                '/store': {
                    get: { operationId: 'listStore' },
                },
            }
        } as any;

        it('should return false if the given operationId is not used', () => {
            const result = doesOperationIdExist('test', openAPISpecStub);
            expect(result).to.be.false;
        });

        it('should return true if the given operationId exists', () => {
           const result = doesOperationIdExist('listUsers', openAPISpecStub);
           expect(result).to.be.true;
        });
    })
});
