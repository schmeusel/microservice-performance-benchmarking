import ActionTypes from '../constants/ActionTypes';

export function onGroupingDistanceChange(value) {
    return {
        type: ActionTypes.SETTINGS.GROUPING_DISTANCE,
        data: value
    };
}
