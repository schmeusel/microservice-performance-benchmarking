import React from 'react';
import PropTypes from 'prop-types';
import { Stepper, Step, StepLabel, StepContent, Paper } from 'material-ui';
import { AsyncPropTypes, StatsPropTypes } from '../constants/CustomPropTypes';
import { PHASES } from '../constants/ApplicationConstants';

const ExperimentPhase = ({ phase }) => {
    function isDisabled(phaseInOrder) {
        const currentIndex = PHASES.ORDER.indexOf(phase);
        const backgroundIndex = PHASES.ORDER.indexOf(phaseInOrder);
        return currentIndex > backgroundIndex;
    }

    function getLabel(phaseName) {
        return phaseName
            .replace('_', ' ')
            .split(' ')
            .map(str => str.toLowerCase())
            .map(str => str.charAt(0).toUpperCase() + str.slice(1))
            .join(' ');
    }

    const content = {
        [PHASES.VALUES.INITIALIZATON]: 'Server just started and all services are being initialized.',
        [PHASES.VALUES.PATTERN_RESOLUTION]:
            'The OpenAPI Specification is being analyzed to find suitable resources that can be mapped against from the given abstract patterns.',
        [PHASES.VALUES.WORKLOAD_GENERATION]:
            'Based on how abstract patterns and single sequence elements were mapped, requests are being generated with fake parameter data.',
        [PHASES.VALUES.REQUEST_TRANSMISSION]: 'Now that workloads have been generated, the resulting pattern requests are being fired and measurements taken.',
        [PHASES.VALUES.MEASUREMENT_EVALUATION]: 'After all requests have been sent, it is time to evaluated the metrics.',
        [PHASES.VALUES.COMPLETION]:
            'The benchmarking process is done. In case of manual evaluation, decide now whether you want the integration step to succeed or fail.'
    };

    const styles = {
        container: {
            display: 'flex',
            flexDirection: 'column',
            padding: 16,
            marginBottom: 32
        }
    };
    return (
        <Paper style={styles.container}>
            <h2>Current Phase of the Experiment</h2>
            <Stepper activeStep={PHASES.ORDER.indexOf(phase)}>
                {PHASES.ORDER.map(phaseName => (
                    <Step key={phaseName} disabled={isDisabled(phaseName)}>
                        <StepLabel>{getLabel(phaseName)}</StepLabel>
                    </Step>
                ))}
            </Stepper>
            <p>{content[phase]}</p>
        </Paper>
    );
};

ExperimentPhase.propTypes = {
    phase: PropTypes.oneOf(PHASES.ORDER)
};

export default ExperimentPhase;
