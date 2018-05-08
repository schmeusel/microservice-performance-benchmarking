import {
    connectedReducer,
    feedbackMessageReducer,
    settingsReducer,
} from '../../../../src/webServer/public/reducers/applicationReducers';
import ActionTypes from '../../../../src/webServer/public/constants/ActionTypes';

describe('Test applicationReducers', () => {
    describe('settingsReducer', () => {
        it('should return the initial state', () => {
            const result = settingsReducer(undefined, {});
            expect(result)
                .toEqual({
                    groupingDistance: 4,
                });
        });

        it('should handle GROUPING_DISTANCE', () => {
            const distanceStub = 1;
            const actionStub = {
                type: ActionTypes.APPLICATION.SETTINGS.GROUPING_DISTANCE,
                data: distanceStub,
            };
            const resultFromScratch = settingsReducer({}, actionStub);
            expect(resultFromScratch)
                .toEqual({
                    groupingDistance: distanceStub,
                });
            const resultWithPreviousProps = settingsReducer({ test: 'test' }, actionStub);
            expect(resultWithPreviousProps)
                .toEqual({
                    groupingDistance: distanceStub,
                    test: 'test',
                });
        });
    });

    describe('feedbackMessageReducer', () => {
        it('should return the initial state', () => {
            const result = feedbackMessageReducer(undefined, {});
            expect(result)
                .toEqual('');
        });

        it('should handle FEEDBACK_MESSAGE', () => {
            const feedbackStub = 'test';
            const actionStub = {
                type: ActionTypes.APPLICATION.FEEDBACK_MESSAGE,
                data: feedbackStub,
            };
            const result = feedbackMessageReducer('', actionStub);
            expect(result)
                .toEqual(feedbackStub);
        });
    });

    describe('connectedReducer', () => {
        it('should return the initial state', () => {
            const result = connectedReducer(undefined, {});
            expect(result)
                .toEqual(false);
        });

        it('should handle CONNECTED', () => {
            const connectedStub = true;
            const actionStub = {
                type: ActionTypes.APPLICATION.CONNECTED,
                data: connectedStub,
            };
            const resultWithTrueState = connectedReducer(true, actionStub);
            const resultWithFalseState = connectedReducer(false, actionStub);
            [ resultWithTrueState, resultWithFalseState ].forEach((result) => {
                expect(result)
                    .toEqual(connectedStub);
            });
        });
    });
});
