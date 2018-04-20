import { MEASUREMENTS } from '../constants/ActionTypes';
export default function reducer(state = [], action) {
    switch (action.type) {
        case MEASUREMENTS.RECEIVE_MEASUREMENTS_BATCH: {
            return [...state, ...action.data].slice(-100);
        }
    }
    return state;
}
