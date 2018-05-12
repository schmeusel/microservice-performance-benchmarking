import ActionTypes from '../constants/ActionTypes';
import EndpointConstants from '../constants/EndpointConstants';
import { showSnackbarFeedback } from './applicationActions';

export function decideOnResult(result) {
    const { DECISION } = EndpointConstants;
    return (dispatch) => {
        dispatch({
            type: ActionTypes.EXPERIMENT.DECISION.ASYNC,
            data: {
                errorCode: 0,
                isLoading: true,
            },
        });
        fetch(DECISION.path(result), {
            method: DECISION.method,
        })
            .then(() => {
                dispatch({
                    type: ActionTypes.EXPERIMENT.DECISION.RESULT,
                    data: result,
                });
                dispatch({
                    type: ActionTypes.EXPERIMENT.DECISION.ASYNC,
                    data: {
                        errorCode: 0,
                        isLoading: false,
                    },
                });
                dispatch(showSnackbarFeedback('Decision successfully made'));
            })
            .catch((error) => {
                dispatch({
                    type: ActionTypes.EXPERIMENT.DECISION.ASYNC,
                    data: {
                        errorCode: error.status,
                        isLoading: false,
                    },
                });
            });
    };
}
