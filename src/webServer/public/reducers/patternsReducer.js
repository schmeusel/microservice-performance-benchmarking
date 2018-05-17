import ActionTypes from '../constants/ActionTypes';

export default function (state = [], action) {
    switch (action.type) {
        case ActionTypes.PATTERNS: {
            return action.data;
        }
        case ActionTypes.MEASUREMENTS.UPDATE: {
            return state.map(pattern => ({
                ...pattern,
                progress: pattern.name === action.data.name
                    ? (action.data.measurements[0].round + 1) / pattern.amount
                    : pattern.progress,
            }));
        }
        case ActionTypes.MEASUREMENTS.FINAL: {
            return state.map(pattern => ({
                ...pattern,
                progress: 1,
            }));
        }
    }
    return state;
}
