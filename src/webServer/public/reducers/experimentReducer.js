import ActionTypes from '../constants/ActionTypes';

const asyncDefaultState = {
    isLoading: false,
    errorCode: 0
};

export function experimentPhaseReducer(state = null, action) {
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

export function experimentStatsReducer(state = {}, action) {
    switch (action.type) {
        case ActionTypes.MEASUREMENTS: {
            return action.data.reduce((finalState, measurement) => {
                const round = Math.max(finalState.pattern ? finalState.pattern.roundmeasurement.round : 0, measurement.round);
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
