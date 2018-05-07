import ActionTypes from '../constants/ActionTypes';
import { PHASES } from '../constants/ApplicationConstants';

const asyncDefaultState = {
    isLoading: false,
    errorCode: 0
};

export function experimentPhaseReducer(state = PHASES.ORDER.shift(), action) {
    switch (action.type) {
        case ActionTypes.EXPERIMENT_PHASE: {
            return action.data;
        }
    }
    return state;
}

export function experimentResultReducer(state = { async: asyncDefaultState, value: null }, action) {
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
                value: action.data
            };
        }
    }
    return state;
}
