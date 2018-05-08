import ActionTypes from '../../../../src/webServer/public/constants/ActionTypes';
import {
    onGroupingDistanceChange,
    showSnackbarFeedback,
    setConnectionFlag,
} from '../../../../src/webServer/public/actions/applicationActions';

describe('Test applicationActions', () => {
    describe('onGroupingDistanceChange(..)', () => {
        it('should use GROUPING_DISTANCE type and set argument to data property', () => {
            const distanceStub = 10;
            const result = onGroupingDistanceChange(distanceStub);
            expect(result)
                .toEqual({
                    type: ActionTypes.APPLICATION.SETTINGS.GROUPING_DISTANCE,
                    data: distanceStub,
                });
        });
    });

    describe('showSnackbarFeedback(..)', () => {
        it('should use FEEDBACK_MESSAGE type and set argument to data property', () => {
            const messageStub = 'success';
            const result = showSnackbarFeedback(messageStub);
            expect(result)
                .toEqual({
                    type: ActionTypes.APPLICATION.FEEDBACK_MESSAGE,
                    data: messageStub,
                });
        });
    });

    describe('setConnectionFlag', () => {
        it('should use CONNECTED type and set argument to data property', () => {
            const connectedStub = true;
            const result = setConnectionFlag(connectedStub);
            expect(result)
                .toEqual({
                    type: ActionTypes.APPLICATION.CONNECTED,
                    data: connectedStub,
                });
        });
    });
});
