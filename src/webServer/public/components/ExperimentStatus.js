import React from 'react';
import PropTypes from 'prop-types';
import { AsyncPropTypes, StatsPropTypes } from '../constants/CustomPropTypes';

const ExperimentStatus = ({ status }) => {
    return <div>Status is {status.value.isRunning}.</div>;
};

ExperimentStatus.propTypes = {
    status: PropTypes.shape({
        async: AsyncPropTypes.isRequired,
        value: PropTypes.shape({
            isRunning: PropTypes.bool.isRequired,
            stats: StatsPropTypes.isRequired
        })
    }).isRequired
};

export default ExperimentStatus;
