import EndpointConstants from '../constants/EndpointConstants';
import ActionTypes from '../constants/ActionTypes';

function handleAsync(isLoading, errorCode) {
    return {
        type: ActionTypes.MEASUREMENTS.FINAL_ASYNC,
        data: {
            isLoading,
            errorCode,
        },
    };
}

function handleResponse(measurements) {
    return {
        type: ActionTypes.MEASUREMENTS.FINAL,
        data: measurements,
    };
}

export function fetchAllMeasurements() {
    const { MEASUREMENTS } = EndpointConstants;
    return (dispatch) => {
        dispatch(handleAsync(true, 0));
        return fetch(MEASUREMENTS.path, {
            method: MEASUREMENTS.method,
        })
            .then(response => response.json())
            .then((patternRequestMeasurements) => {
                dispatch(handleResponse(patternRequestMeasurements));
                dispatch(handleAsync(false, 0));
            })
            .catch((error) => {
                handleAsync(false, error.status);
            });
    };
}

