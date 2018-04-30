import ActionTypes from '../constants/ActionTypes';

export default function handleSocket(data) {
    console.log('handling socket in actions', data);

    return {
        type: data.type,
        data: data.data
    };
}
