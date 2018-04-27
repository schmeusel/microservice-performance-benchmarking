import { createStore, applyMiddleware, combineReducers } from 'redux';
import measurementsReducer from '../reducers/measurementReducer';
import experimentReducer from '../reducers/experimentReducer';
import { socketMiddleware } from './socketMiddleware';

const rootReducers = combinedReducers({
    experiment: experimentReducer,
    measurements: measurementsReducer
});

export default createStore(rootReducers, applyMiddleware(socketMiddleware));
