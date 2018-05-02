import ActionTypes from '../constants/ActionTypes';
import EndpointConstants from '../constants/EndpointConstants';

export function decideOnResult(result) {
    const { DECISION } = EndpointConstants;
    return dispatch => {
        dispatch({
            type: ActionTypes.EXPERIMENT_DECISION.ASYNC,
            data: {
                errorCode: 0,
                isLoading: true
            }
        });
        fetch(DECISION.path(result), {
            method: DECISION.method
        })
            .then(() => {
                dispatch({
                    type: ActionTypes.EXPERIMENT_DECISION.RESULT,
                    data: result
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
                console.log('error in decision making', error);
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
