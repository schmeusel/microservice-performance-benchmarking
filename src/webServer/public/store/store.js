import { createStore, applyMiddleware, combineReducers } from 'redux';
import measurementsReducer from '../reducers/measurementReducer';
import { experimentStatusReducer, experimentResultReducer } from '../reducers/experimentReducer';
import thunk from 'redux-thunk';
import logger from 'redux-logger';

const rootReducers = combineReducers({
    experiment: combineReducers({
        status: experimentStatusReducer,
        result: experimentResultReducer
    }),
    measurements: measurementsReducer
});

export default createStore(rootReducers, applyMiddleware(thunk, logger));
