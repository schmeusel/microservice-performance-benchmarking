import React from 'react';
import PropTypes from 'prop-types';
import { AsyncPropTypes, StatsPropTypes } from '../constants/CustomPropTypes';
import { PHASES } from '../constants/ApplicationConstants';

const ExperimentPhase = ({ phase }) => {
    return (
        <div>
            Current phase is <b>{phase}</b>.
        </div>
    );
};

ExperimentPhase.propTypes = {
    phase: PropTypes.oneOf(PHASES.ORDER)
};

export default ExperimentPhase;
