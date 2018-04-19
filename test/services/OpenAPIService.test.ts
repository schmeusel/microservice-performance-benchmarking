import * as sinon from 'sinon';
import { expect } from 'chai';
import * as proxyquire from 'proxyquire';

import PatternResolverError from '../../src/exceptions/PatternResolverError';
import OpenAPIError from '../../src/exceptions/OpenAPIError';

const openAPISpec = require('../../assets/sampleAPI_extended.json');

describe('Test OpenAPIService', () => {
    // describe('initialize(...)', () => {
    //     it('should call the Swagger instructor to resolve the spec and set the client', done => {
    //         const resolveStub = {
    //             client: {
    //                 spec: {
    //                     paths: {}
    //                 }
    //             }
    //         };
    //         const swaggerStub = sinon.stub().resolves(resolveStub);
    //         const OpenAPIService = proxyquire('../../src/services/OpenAPIService.ts', {
    //             'swagger-client': swaggerStub,
    //             '@noCallThru': true
    //         });
    //         console.log('service', OpenAPIService);
    //         OpenAPIService.initialize('http://petstore.swagger.io/v2/swagger.json', {})
    //             .then(() => {
    //                 const specResult = OpenAPIService.specification;
    //                 const resources = OpenAPIService.resources;
    //                 expect(specResult).to.exist;
    //                 expect(resources).to.exist;
    //                 done();
    //             })
    //             .catch(e => {
    //                 console.log('caught althrough not desired');
    //                 done();
    //             });
    //     });
    // });
    // describe('specification()', () => {
    //     it('should throw an error if the client has not been set yet', () => {
    //         expect(() => OpenAPIService.specification).to.throw(OpenAPIError);
    //     });
    // });
    // describe('resources()', () => {
    //     it('should throw an error if resources have not been set during initialization', () => {
    //         expect(() => OpenAPIService.resources).to.throw(OpenAPIError);
    //     });
    // });
});
