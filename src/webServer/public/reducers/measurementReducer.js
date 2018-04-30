import ActionTypes from '../constants/ActionTypes';
export default function reducer(state = [], action) {
    console.log('measurement reducer with action', action);
    switch (action.type) {
        case ActionTypes.MEASUREMENTS: {
            return [...state, ...action.data].slice(-100);
        }
    }
    console.log('returning default state');
    return state;
}
