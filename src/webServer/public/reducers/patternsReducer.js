import ActionTypes from '../constants/ActionTypes';

export default function (state = [], action) {
    switch (action.type) {
        case ActionTypes.PATTERNS: {
            if (action.data) {
                return action.data;
            }
            return state;
        }
    }
    return state;
}
