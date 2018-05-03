import { createStore, applyMiddleware, combineReducers } from 'redux';
import measurementsReducer from '../reducers/measurementReducer';
import { experimentPhaseReducer, experimentResultReducer } from '../reducers/experimentReducer';
import thunk from 'redux-thunk';
import logger from 'redux-logger';

const rootReducers = combineReducers({
    experiment: combineReducers({
        phase: experimentPhaseReducer,
        result: experimentResultReducer
    }),
    measurements: measurementsReducer
});

export default createStore(rootReducers, applyMiddleware(thunk, logger));
