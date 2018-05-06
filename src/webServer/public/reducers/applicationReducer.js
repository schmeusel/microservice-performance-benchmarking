import ActionTypes from '../constants/ActionTypes';

export function settingsReducer(state = { groupingDistance: 4 }, action) {
    switch (action.type) {
        case ActionTypes.SETTINGS.GROUPING_DISTANCE: {
            return {
                ...state,
                groupingDistance: action.data
            };
        }
    }
    return state;
}
