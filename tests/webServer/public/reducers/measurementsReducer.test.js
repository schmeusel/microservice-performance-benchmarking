import measurementsReducer from '../../../../src/webServer/public/reducers/measurementsReducer';
import ActionTypes from '../../../../src/webServer/public/constants/ActionTypes';

describe('Test measurementsReducer', () => {
    // TODO re-enable once default state is set back to normal
    // it('should return the initial state', () => {
    //     const result = measurementsReducer(undefined, {});
    //     expect(result).toEqual({});
    // });

    it('should handle MEASUREMENTS_UPDATE', () => {
        const operationStub = 'op';
        const timestampStartSub = 4;
        const timestampEndStub = 10;
        const measurementStub = (status, i) => ({
            timestampStart: timestampStartSub,
            timestampEnd: timestampEndStub,
            patternIndex: i,
            operation: operationStub,
            status,
        });
        const nameStubFirst = 'test';
        const firstIndexStub = 1;
        const dataStub = (name, index) => ({
            name,
            measurements: [measurementStub(200, index), measurementStub(400, index)],
        });
        const actionStub = (name, index) => ({
            type: ActionTypes.MEASUREMENTS.UPDATE,
            data: dataStub(name, index),
        });
        const result = measurementsReducer({}, actionStub(nameStubFirst, firstIndexStub));
        const latencyResult = timestampEndStub - timestampStartSub;
        expect(result.values).toEqual({
            [nameStubFirst]: {
                [firstIndexStub]: {
                    operation: operationStub,
                    latencies: {
                        success: [latencyResult],
                        error: [latencyResult],
                    },
                },
            },
        });

        const secondIndexStub = 2;
        const nameStubSecond = 'hello';
        const resultWithPreviousMap = measurementsReducer(result, actionStub(nameStubSecond, secondIndexStub));
        expect(resultWithPreviousMap.values).toEqual({
            [nameStubFirst]: {
                [firstIndexStub]: {
                    operation: operationStub,
                    latencies: {
                        success: [latencyResult],
                        error: [latencyResult],
                    },
                },
            },
            [nameStubSecond]: {
                [secondIndexStub]: {
                    operation: operationStub,
                    latencies: {
                        success: [latencyResult],
                        error: [latencyResult],
                    },
                },
            },
        });

        const resultWithPreviousSameName = measurementsReducer(resultWithPreviousMap,
            actionStub(nameStubFirst, firstIndexStub),
        );
        expect(resultWithPreviousSameName.values).toEqual({

            [nameStubFirst]: {
                [firstIndexStub]: {
                    operation: operationStub,
                    latencies: {
                        success: [latencyResult, latencyResult],
                        error: [latencyResult, latencyResult],
                    },
                },
            },
            [nameStubSecond]: {
                [secondIndexStub]: {
                    operation: operationStub,
                    latencies: {
                        success: [latencyResult],
                        error: [latencyResult],
                    },
                },
            },
        });
    });

    it('should handle MEASUREMENTS_FINAL_ASYNC', () => {
        const previousState = {
            values: 'test',
            async: {
                isLoading: false,
                errorCode: 200,
            },
        };
        const asyncStub = {
            isLoading: true,
            errorCode: 0,
        };
        const actionStub = {
            type: ActionTypes.MEASUREMENTS.FINAL_ASYNC,
            data: asyncStub,
        };
        const result = measurementsReducer(previousState, actionStub);
        expect(result.values).toEqual('test');
        expect(result.async).toEqual(asyncStub);
    });
});
