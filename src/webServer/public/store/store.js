import { createStore, applyMiddleware, combineReducers } from 'redux';
import measurementsReducer from '../reducers/measurementReducer';
import {
    experimentStatusReducer,
    experimentResultReducer,
    experimentStatsReducer
} from '../reducers/experimentReducer';
import thunk from 'redux-thunk';
import logger from 'redux-logger';

const rootReducers = combineReducers({
    experiment: combineReducers({
        status: experimentStatusReducer,
        result: experimentResultReducer,
        statistics: experimentStatsReducer
    }),
    measurements: measurementsReducer
});

export default createStore(rootReducers, applyMiddleware(thunk, logger));
