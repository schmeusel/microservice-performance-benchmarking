import ActionTypes from '../constants/ActionTypes';

export default function (state = [], action) {
    switch (action.type) {
        case ActionTypes.PATTERNS: {
            return action.data;
        }
        case ActionTypes.MEASUREMENTS.UPDATE: {
            return state.map(pattern => ({
                ...pattern,
                progress: action.data.measurements[0].round / pattern.amount,
            }));
        }
        case ActionTypes.MEASUREMENTS.FINAL: {
            return state.map(pattern => ({
                ...pattern,
                progress: 0.8,
            }));
        }
    }
    return state;
}
