import patternsReducer from '../../../../src/webServer/public/reducers/patternsReducer';
import ActionTypes from '../../../../src/webServer/public/constants/ActionTypes';

describe('Test patternReducer', () => {
    it('should return the initial state', () => {
        const result = patternsReducer(undefined, {});
        expect(result)
            .toEqual([]);
    });

    it('should handle PATTERNS', () => {
        const dataStub = ['test', 'hello'];
        const actionStub = {
            type: ActionTypes.PATTERNS,
            data: dataStub,
        };
        const resultWithEmptyState = patternsReducer([], actionStub);
        expect(resultWithEmptyState)
            .toEqual(dataStub);

        const resultWithPreviousElements = patternsReducer(['build'], actionStub);
        expect(resultWithPreviousElements)
            .toEqual(dataStub);
    });
});
