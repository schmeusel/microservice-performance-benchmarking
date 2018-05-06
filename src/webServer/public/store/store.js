import { createStore, applyMiddleware, combineReducers } from 'redux';
import measurementsReducer from '../reducers/measurementReducer';
import patternsReducer from '../reducers/patternsReducer';
import { experimentPhaseReducer, experimentResultReducer } from '../reducers/experimentReducer';
import { settingsReducer, feedbackMessageReducer } from '../reducers/applicationReducer';
import thunk from 'redux-thunk';
import logger from 'redux-logger';

const rootReducers = combineReducers({
    application: combineReducers({
        settings: settingsReducer,
        feedbackMessage: feedbackMessageReducer
    }),
    experiment: combineReducers({
        phase: experimentPhaseReducer,
        result: experimentResultReducer
    }),
    patterns: patternsReducer,
    measurements: measurementsReducer
});

export default createStore(rootReducers, applyMiddleware(thunk, logger));
