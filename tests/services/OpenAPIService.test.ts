import { expect } from 'chai';
import OpenAPIService from '../../src/services/OpenAPIService';
import OpenAPIError from '../../src/exceptions/OpenAPIError';
import { AbstractPatternElementOperation } from '../../src/interfaces';
import PolyfillUtil from '../../src/utils/PolyfillUtil';

describe('Test OpenAPIService', () => {
    const openAPISpecStub = require('../stubs/OpenAPISpecificationStub.json');

    before(() => {
        PolyfillUtil.initialize();
    });

    describe('specification()', () => {
        it('should throw an error if the client has not been set yet', () => {
            expect(() => OpenAPIService.specification).to.throw(OpenAPIError);
        });
    });

    describe('resources()', () => {
        it('should throw an error if resources have not been set during initialization', () => {
            expect(() => OpenAPIService.resources).to.throw(OpenAPIError);
        });
    });

    describe('initialize(...)', () => {
        it('should derive resources from a spec file and make the class property accessible', done => {
            OpenAPIService.initialize(openAPISpecStub, {})
                .then(() => {
                    const { SCAN, CREATE, READ } = AbstractPatternElementOperation;
                    const expectedResources = [
                        {
                            name: 'pets',
                            path: '/pets',
                            accessors: ['petId'],
                            operations: [SCAN, CREATE, READ],
                            subResources: []
                        }
                    ];
                    expect(OpenAPIService.resources).to.exist;
                    expect(OpenAPIService.specification).to.exist;
                    expect(OpenAPIService.resources).to.deep.equal(expectedResources);
                    done();
                })
                .catch(done);
        });
    });
});
