import { MEASUREMENTS } from '../constants/ActionTypes';

export const socketMiddleware = state => next => action => {
    if (action.type === 'socket_notificatin') {
        socketHandler(action, store.dispatch);
    } else {
        next(action);
    }
};

const socketHandler = (action, dispatch) => {
    switch (action.payload.type) {
        case 'MEASUREMENT_BATCH': {
            dispatch({ type: MEASUREMENTS.RECEIVE_MEASUREMENTS_BATCH, data: action.payload.data });
            break;
        }
    }
};
