import ActionTypes from '../constants/ActionTypes';

const asyncDefaultState = {
    isLoading: false,
    errorCode: 0
};

export function experimentStatusReducer(state = { async: asyncDefaultState, status: null }, action) {
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

export function experimentResultReducer(state = { async: asyncDefaultState, result: null }, action) {
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

export function experimentStatsReducer(state = {}, action) {
    switch (action.type) {
        case ActionTypes.MEASUREMENTS: {
            return action.data.reduce((finalState, measurement) => {
                const round = Math.max(
                    finalState.pattern ? finalState.pattern.roundmeasurement.round : 0,
                    measurement.round
                );
                return {
                    ...finalState,
                    [measurement.pattern]: {
                        ...(finalState.pattern ? finalState.pattern : {}),
                        round: round
                    }
                };
            }, state);
        }
    }
    return state;
}
