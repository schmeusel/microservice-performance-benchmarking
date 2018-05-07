import { expect } from 'chai';
import AbstractPatternResolver from '../../src/pattern/AbstractPatternResolver';
import { AbstractPatternElementOperation, PatternElementSelector, PatternElementOutputType } from '../../src/interfaces';

describe('Test AbstractPatternResolver', () => {
    describe('initialize(...)', () => {
        it('should resolve abstract pattern and set its pattern property during initialization', done => {
            const patternsStub = [
                {
                    name: 'Test Pattern',
                    sequence: [
                        {
                            operation: AbstractPatternElementOperation.SCAN,
                            output: 'list',
                            wait: 1000
                        },
                        {
                            operation: AbstractPatternElementOperation.READ,
                            input: 'list',
                            selector: PatternElementSelector.RANDOM,
                            output: 'item',
                            wait: 1000
                        }
                    ],
                    weight: 1
                }
            ];
            const openAPISpecStub = {
                paths: {
                    '/user': {
                        get: {
                            operationId: 'listUsers'
                        }
                    },
                    '/user/{userId}': {
                        get: {
                            operationId: 'getUser'
                        }
                    }
                }
            } as any;
            const resourcesStub = [
                {
                    name: 'user',
                    path: '/user',
                    selector: 'userId',
                    operations: [AbstractPatternElementOperation.SCAN, AbstractPatternElementOperation.READ],
                    subResources: []
                }
            ] as any[];
            AbstractPatternResolver.initialize(patternsStub, openAPISpecStub, resourcesStub, {})
                .then(() => {
                    const { patterns } = AbstractPatternResolver;
                    expect(patterns).to.deep.equal([
                        {
                            name: 'Test Pattern',
                            weight: 1,
                            sequence: [
                                {
                                    operationId: 'listUsers',
                                    wait: 1000,
                                    input: undefined,
                                    output: 'list',
                                    outputType: PatternElementOutputType.LIST,
                                    selector: undefined
                                },
                                {
                                    operationId: 'getUser',
                                    wait: 1000,
                                    input: 'list',
                                    output: 'item',
                                    outputType: PatternElementOutputType.ITEM,
                                    selector: PatternElementSelector.RANDOM
                                }
                            ]
                        }
                    ]);
                    done();
                })
                .catch(done);
        });
    });
});
