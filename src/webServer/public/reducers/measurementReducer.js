import ActionTypes from '../constants/ActionTypes';
export default function reducer(state = [], action) {
    switch (action.type) {
        case ActionTypes.MEASUREMENTS.RECEIVE: {
            return [...state, ...action.data].slice(-100);
        }
    }
    return state;
}
