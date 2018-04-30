import { createStore, applyMiddleware, combineReducers } from 'redux';
import measurementsReducer from '../reducers/measurementReducer';
import { experimentStatusReducer, experimentResultReducer } from '../reducers/experimentReducer';
import { socketMiddleware } from './socketMiddleware';

const rootReducers = combinedReducers({
    experiment: {
        status: experimentStatusReducer,
        result: experimentResultReducer
    },
    measurements: measurementsReducer
});

export default createStore(rootReducers, applyMiddleware(socketMiddleware));
