import ActionTypes from '../constants/ActionTypes';
export default function reducer(state = {}, action) {
    switch (action.type) {
        case ActionTypes.EXPERIMENT_STATUS.ASYNC: {
            return {
                ...state,
                status: {
                    ...state.status,
                    async: action.data
                }
            };
        }
        case ActionTypes.EXPERIMENT_STATUS.RESULT: {
            return {
                ...state,
                status: {
                    ...state.status,
                    async: action.data
                }
            };
        }
    }
    return state;
}
