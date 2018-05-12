import ActionTypes from '../constants/ActionTypes';

export function settingsReducer(state = { groupingDistance: 4 }, action) {
    switch (action.type) {
        case ActionTypes.APPLICATION.SETTINGS.GROUPING_DISTANCE: {
            return {
                ...state,
                groupingDistance: action.data,
            };
        }
    }
    return state;
}

export function feedbackMessageReducer(state = '', action) {
    switch (action.type) {
        case ActionTypes.APPLICATION.FEEDBACK_MESSAGE: {
            return action.data;
        }
    }
    return state;
}

export function connectedReducer(state = false, action) {
    switch (action.type) {
        case ActionTypes.APPLICATION.CONNECTED: {
            return action.data;
        }
    }
    return state;
}
