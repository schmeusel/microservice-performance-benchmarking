import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import logger from 'redux-logger';
import measurementsReducer from '../reducers/measurementsReducer';
import patternsReducer from '../reducers/patternsReducer';
import { experimentPhaseReducer, experimentResultReducer, manualDecisionReducer } from '../reducers/experimentReducers';
import { settingsReducer, feedbackMessageReducer, connectedReducer } from '../reducers/applicationReducers';

const rootReducers = combineReducers({
    application: combineReducers({
        connected: connectedReducer,
        settings: settingsReducer,
        feedbackMessage: feedbackMessageReducer,
    }),
    experiment: combineReducers({
        phase: experimentPhaseReducer,
        result: experimentResultReducer,
        manualDecision: manualDecisionReducer,
    }),
    patterns: patternsReducer,
    measurements: measurementsReducer,
});

export default createStore(
    rootReducers,
    applyMiddleware(
        thunk,
        // logger,
    ),
);
