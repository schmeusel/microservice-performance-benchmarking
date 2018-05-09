import React from 'react';
import PropTypes from 'prop-types';
import { PHASES } from '../../constants/ApplicationConstants';

const ExperimentPhaseContent = ({ phase }) => {
    const content = {
        [PHASES.VALUES.INITIALIZATON]: 'Server just started and all services are being initialized.',
        [PHASES.VALUES.PATTERN_RESOLUTION]:
            'The OpenAPI Specification is being analyzed to find suitable resources that can be mapped against from the given abstract patterns.',
        [PHASES.VALUES.WORKLOAD_GENERATION]:
            'Based on how abstract patterns and single sequence elements were mapped, requests are being generated with fake parameter data.',
        [PHASES.VALUES.REQUEST_TRANSMISSION]:
            'Now that workloads have been generated, the resulting pattern requests are being fired and measurements taken.',
        [PHASES.VALUES.MEASUREMENT_EVALUATION]:
            'After all requests have been sent, it is time to evaluated the metrics.',
        [PHASES.VALUES.COMPLETION]:
            'The benchmarking process is done. In case of manual evaluation, decide now whether you want the integration step to succeed or fail.',
    };

    return <p>{content[phase]}</p>;
};

ExperimentPhaseContent.propTypes = {
    phase: PropTypes.oneOf(PHASES.ORDER),
};

export default ExperimentPhaseContent;
