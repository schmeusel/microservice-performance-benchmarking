import ActionTypes from '../constants/ActionTypes';

export function getExperimentStatus() {
    return dispatch => {
        dispatch({
            type: ActionTypes.EXPERIMENT_STATUS.ASYNC,
            data: {
                errorCode: 0,
                isLoading: true
            }
        });
        fetch('/status')
            .then(res => res.json())
            .then(data => {
                dispatch({
                    type: ActionTypes.EXPERIMENT_STATUS.RESULT,
                    data: data
                });
                dispatch({
                    type: ActionTypes.EXPERIMENT_STATUS.ASYNC,
                    data: {
                        errorCode: 0,
                        isLoading: false
                    }
                });
            })
            .catch(err => {
                dispatch({
                    type: ActionTypes.EXPERIMENT_STATUS.ASYNC,
                    data: {
                        errorCode: err.status,
                        isLoading: false
                    }
                });
            });
    };
}

export function decideOnResult(result) {
    return dispatch => {
        dispatch({
            type: ActionTypes.EXPERIMENT_DECISION.ASYNC,
            data: {
                errorCode: 0,
                isLoading: true
            }
        });
        fetch(`/end/${result}`)
            .then(() => {
                dispatch({
                    type: ActionTypes.EXPERIMENT_DECISION.RESULT,
                    data: {
                        result: result
                    }
                });
                dispatch({
                    type: ActionTypes.EXPERIMENT_DECISION.ASYNC,
                    data: {
                        errorCode: 0,
                        isLoading: false
                    }
                });
            })
            .catch(error => {
                dispatch({
                    type: ActionTypes.EXPERIMENT_DECISION.ASYNC,
                    data: {
                        errorCode: error.status,
                        isLoading: false
                    }
                });
            });
    };
}
