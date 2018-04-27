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
