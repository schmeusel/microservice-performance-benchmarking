import {
    experimentPhaseReducer,
    experimentResultReducer
} from '../../../../src/webServer/public/reducers/experimentReducers';
import { PHASES } from '../../../../src/webServer/public/constants/ApplicationConstants';
import ActionTypes from '../../../../src/webServer/public/constants/ActionTypes';

describe('Test experimentReducers', () => {
    describe('experimentPhaseReducer', () => {
        it('should return the initial state', () => {
            const result = experimentPhaseReducer(undefined, {});
            expect(result).toEqual(PHASES.ORDER[0]);
        });

        it('should handle EXPERIMENT_PHASE', () => {
            const phaseStub = 'test';
            const actionStub = {
                type: ActionTypes.EXPERIMENT.PHASE,
                data: phaseStub
            };
            const result = experimentPhaseReducer('hello', actionStub);
            expect(result).toEqual(phaseStub);
        });
    });

    describe('experimentResultReducer', () => {
        it('should return the initial state', () => {
            const result = experimentResultReducer(undefined, {});
            expect(result).toEqual({
                async: {
                    isLoading: false,
                    errorCode: 0
                },
                value: null
            });
        });

        it('should handle EXPERIMENT.DECISION.ASYNC', () => {
            const errorCodeStub = 500;
            const isLoadingStub = true;
            const valueMock = 'test';
            const actionStub = {
                type: ActionTypes.EXPERIMENT.DECISION.ASYNC,
                data: {
                    isLoading: isLoadingStub,
                    errorCode: errorCodeStub
                }
            };
            const stateStub = {
                value: valueMock,
                async: {
                    isLoading: false,
                    errorCode: 0
                }
            };
            const result = experimentResultReducer(stateStub, actionStub);
            expect(result).toEqual({
                value: valueMock,
                async: {
                    isLoading: isLoadingStub,
                    errorCode: errorCodeStub
                }
            });
        });

        it('should handle EXPERIMENT.DECISION.RESULT', () => {
            const asyncStub = {
                isLoading: true,
                errorCode: 0
            };
            const valueStubSucceed = 'succeed';
            const valueStubFail = 'fail';
            const actionStub = valueStub => ({
                type: ActionTypes.EXPERIMENT.DECISION.RESULT,
                data: valueStub
            });
            const stateStub = {
                async: asyncStub,
                value: 'test'
            };
            const resultWithSucceed = experimentResultReducer(stateStub, actionStub(valueStubSucceed));
            const resultWithFail = experimentResultReducer(stateStub, actionStub(valueStubFail));

            expect(resultWithSucceed).toEqual({
                async: asyncStub,
                value: valueStubSucceed
            });
            expect(resultWithFail).toEqual({
                async: asyncStub,
                value: valueStubFail
            });
        });

        it('should return the input state if data is not "succeed" or "fail" for EXPERIMENT.DECISION.RESULT', () => {
            const actionStub = {
                type: ActionTypes.EXPERIMENT.DECISION.RESULT,
                data: 'hello'
            };
            const stateStub = {
                async: {
                    isLoading: true,
                    errorCode: 0
                },
                value: 'test'
            };
            const result = experimentResultReducer(stateStub, actionStub);
            expect(result).toEqual(stateStub);
        });
    });
});
