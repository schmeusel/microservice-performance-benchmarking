import ActionTypes from '../constants/ActionTypes';
import EndpointConstants from '../constants/EndpointConstants';
import { showSnackbarFeedback } from './applicationActions';

function handleAsync(isLoading, errorCode) {
    return {
        type: ActionTypes.EXPERIMENT.DECISION.ASYNC,
        data: {
            errorCode,
            isLoading,
        },
    };
}

function handleResponse(result) {
    return {
        type: ActionTypes.EXPERIMENT.DECISION.RESULT,
        data: result,
    };
}

export function decideOnResult(result) {
    const { DECISION } = EndpointConstants;
    return (dispatch) => {
        dispatch(handleAsync(true, 0));
        return fetch(DECISION.path(result), {
            method: DECISION.method,
        })
            .then(() => {
                dispatch(handleResponse(result));
                dispatch(handleAsync(false, 0));
                dispatch(showSnackbarFeedback('Decision successfully made'));
            })
            .catch((error) => {
                dispatch(handleAsync(false, error.status));
            });
    };
}
