import ActionTypes from '../constants/ActionTypes';

export function onGroupingDistanceChange(value) {
    return {
        type: ActionTypes.APPLICATION.SETTINGS.GROUPING_DISTANCE,
        data: value
    };
}

export function showSnackbarFeedback(message) {
    return {
        type: ActionTypes.APPLICATION.FEEDBACK_MESSAGE,
        data: message
    };
}
