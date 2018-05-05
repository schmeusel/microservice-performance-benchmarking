import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Stepper, Step, StepLabel, StepContent } from 'material-ui';

import { AsyncPropTypes, StatsPropTypes } from '../../constants/CustomPropTypes';
import { PHASES } from '../../constants/ApplicationConstants';
import PaperContainer from '../../containers/PaperContainer';
import ExperimentPhaseLabel from './ExperimentPhaseLabel';
import ExperimentPhaseContent from './ExperimentPhaseContent';

export default class ExperimentPhase extends PureComponent {
    static propTypes = {
        phase: PropTypes.oneOf(PHASES.ORDER)
    };

    isCompleted(phaseName) {
        const { phase } = this.props;
        const currentIndex = PHASES.ORDER.indexOf(phase);
        const backgroundIndex = PHASES.ORDER.indexOf(phaseName);
        return currentIndex > backgroundIndex;
    }

    isDisabled(phaseName) {
        const { phase } = this.props;
        const currentIndex = PHASES.ORDER.indexOf(phase);
        const backgroundIndex = PHASES.ORDER.indexOf(phaseName);
        return currentIndex < backgroundIndex;
    }

    render() {
        const { phase } = this.props;
        return (
            <PaperContainer heading={'Current Phase of the Experiment'}>
                <Stepper activeStep={PHASES.ORDER.indexOf(phase)}>
                    {PHASES.ORDER.map(phaseName => (
                        <Step
                            key={phaseName}
                            disabled={this.isDisabled(phaseName)}
                            completed={this.isCompleted(phaseName)}
                        >
                            <StepLabel>
                                <ExperimentPhaseLabel
                                    completed={this.isCompleted(phaseName)}
                                    disabled={this.isDisabled(phaseName)}
                                    phase={phaseName}
                                />
                            </StepLabel>
                        </Step>
                    ))}
                </Stepper>
                <ExperimentPhaseContent phase={phase} />
            </PaperContainer>
        );
    }
}
