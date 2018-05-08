import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import fetchMock from 'fetch-mock';
import EndpointConstants from '../../../../src/webServer/public/constants/EndpointConstants';
import { decideOnResult } from '../../../../src/webServer/public/actions/experimentActions';
import ActionTypes from '../../../../src/webServer/public/constants/ActionTypes';

const mockStore = configureMockStore([ thunk ]);

describe('Test experimentActions', () => {
    describe('decideOnResult(...)', () => {
        const store = mockStore({});

        it('should dispatch an ASYNC type before and a RESULT & ASYNC & FEEDBACK_MESSAGE type in case of success', () => {
            const resultStub = 'succeed';
            const path = EndpointConstants.DECISION.path(resultStub);
            fetchMock
                .postOnce(path, 200);
            const expectedFirstAction = {
                type: ActionTypes.EXPERIMENT.DECISION.ASYNC,
                data: {
                    errorCode: 0,
                    isLoading: true,
                },
            };
            store.dispatch(decideOnResult(resultStub))
                .then(() => {

                    expect(store.getActions())
                        .toEqual([ expectedFirstAction,
                            {
                                type: ActionTypes.EXPERIMENT.DECISION.RESULT,
                                data: resultStub,
                            },
                            {
                                type: ActionTypes.EXPERIMENT.DECISION.ASYNC,
                                data: {
                                    errorCode: 0,
                                    isLoading: false,
                                },
                            },
                            {
                                type: ActionTypes.APPLICATION.FEEDBACK_MESSAGE,
                                data: 'Decision successfully made',
                            },
                        ]);
                });
        });

        it('should dispatch an ASYNC type before and an ASYNC type in case of failure', () => {
            const resultStub = 'succeed';
            const errorCodeStub = 500;
            const path = EndpointConstants.DECISION.path(resultStub);
            fetchMock
                .postOnce(path, errorCodeStub);
            const expectedFirstAction = {
                type: ActionTypes.EXPERIMENT.DECISION.ASYNC,
                data: {
                    errorCode: 0,
                    isLoading: true,
                },
            };
            store.dispatch(decideOnResult(resultStub))
                .catch(() => {
                    expect(store.getActions())
                        .toEqual([ expectedFirstAction,
                            {
                                type: ActionTypes.EXPERIMENT.DECISION.ASYNC,
                                data: {
                                    errorCode: errorCodeStub,
                                    isLoading: false,
                                },
                            },
                        ]);
                });
        });
    });
});
