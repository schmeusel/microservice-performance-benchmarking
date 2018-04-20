import { createStore, applyMiddleware, combineReducers } from 'redux';
import measurementsReducer from '../reducers/measurementReducer';
import { socketMiddleware } from './socketMiddleware';

const rootReducers = combinedReducers({
    measurements: measurementsReducer
});

export default createStore(rootReducers, applyMiddleware(socketMiddleware));
