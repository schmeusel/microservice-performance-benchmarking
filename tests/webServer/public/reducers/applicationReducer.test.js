import { settingsReducer } from '../../../../src/webServer/public/reducers/applicationReducer';
import ActionTypes from '../../../../src/webServer/public/constants/ActionTypes';

describe('Test applicationReducers', () => {
    describe('settingsReducer', () => {
        it('should return the initial state', () => {
            const result = settingsReducer(undefined, {});
            expect(result).toEqual({
                groupingDistance: 4
            });
        });

        it('should handle GROUPING_DISTANCE', () => {
            const distanceStub = 1;
            const actionStub = {
                type: ActionTypes.APPLICATION.SETTINGS.GROUPING_DISTANCE,
                value: distanceStub
            };
            const result = settingsReducer({}, actionStub);
            expect(result).toEqual({
                groupingDistance: distanceStub
            });
        });
    });
});
