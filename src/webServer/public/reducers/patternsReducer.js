import ActionTypes from '../constants/ActionTypes';

export default function (state = [], action) {
    switch (action.type) {
        case ActionTypes.PATTERNS: {
            return action.data;
        }
    }
    return state;
}
