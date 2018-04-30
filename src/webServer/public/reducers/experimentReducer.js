import ActionTypes from '../constants/ActionTypes';
export function experimentStatusReducer(state = {}, action) {
    switch (action.type) {
        case ActionTypes.EXPERIMENT_STATUS.ASYNC: {
            return {
                ...state,
                async: action.data
            };
        }
        case ActionTypes.EXPERIMENT_STATUS.RESULT: {
            return {
                ...state,
                status: action.data
            };
        }
    }
    return state;
}

export function experimentResultReducer(state = {}, action) {
    switch (action.type) {
        case ActionTypes.EXPERIMENT_DECISION.ASYNC: {
            return {
                ...state,
                async: action.data
            };
        }
        case ActionTypes.EXPERIMENT_DECISION.RESULT: {
            return {
                ...state,
                result: action.data
            };
        }
    }
    return state;
}
