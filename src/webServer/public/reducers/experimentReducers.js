import ActionTypes from '../constants/ActionTypes';
import {PHASES} from '../constants/ApplicationConstants';

const asyncDefaultState = {
    isLoading: false,
    errorCode: 0
};

export function experimentPhaseReducer(state = PHASES.ORDER.shift(), action) {
    switch (action.type) {
        case ActionTypes.EXPERIMENT.PHASE: {
            return action.data;
        }
    }
    return state;
}

export function experimentResultReducer(state = {async: asyncDefaultState, value: null}, action) {
    switch (action.type) {
        case ActionTypes.EXPERIMENT.DECISION.ASYNC: {
            return {
                ...state,
                async: action.data
            };
        }
        case ActionTypes.EXPERIMENT.DECISION.RESULT: {
            if (!['fail', 'succeed'].includes(action.data)) {
                return state;
            }
            return {
                ...state,
                value: action.data
            };
        }
    }
    return state;
}