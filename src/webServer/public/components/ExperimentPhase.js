import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Stepper, Step, StepLabel, StepContent } from 'material-ui';
import { AsyncPropTypes, StatsPropTypes } from '../constants/CustomPropTypes';
import { PHASES } from '../constants/ApplicationConstants';
import PaperContainer from '../containers/PaperContainer';

export default class ExperimentPhase extends PureComponent {
    static propTypes = {
        phase: PropTypes.oneOf(PHASES.ORDER)
    };

    constructor(props) {
        super(props);
        this.state = {
            visiblePhase: props.phase
        };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.phase !== this.props.phase) {
            this.setState({
                visiblePhase: nextProps.phase
            });
        }
    }

    isCompleted(phaseName) {
        const { phase } = this.props;
        const currentIndex = PHASES.ORDER.indexOf(phase);
        const backgroundIndex = PHASES.ORDER.indexOf(phaseName);
        return currentIndex > backgroundIndex;
    }

    getLabel(phaseName) {
        if (phaseName !== this.state.visiblePhase && phaseName !== this.props.phase) {
            return null;
        }
        return phaseName
            .replace('_', ' ')
            .split(' ')
            .map(str => str.toLowerCase())
            .map(str => str.charAt(0).toUpperCase() + str.slice(1))
            .join(' ');
    }

    onChangeVisible = phaseName => () => {
        this.setState({
            visiblePhase: phaseName
        });
    };

    getContent(phaseName) {
        const content = {
            [PHASES.VALUES.INITIALIZATON]: 'Server just started and all services are being initialized.',
            [PHASES.VALUES.PATTERN_RESOLUTION]:
                'The OpenAPI Specification is being analyzed to find suitable resources that can be mapped against from the given abstract patterns.',
            [PHASES.VALUES.WORKLOAD_GENERATION]:
                'Based on how abstract patterns and single sequence elements were mapped, requests are being generated with fake parameter data.',
            [PHASES.VALUES.REQUEST_TRANSMISSION]:
                'Now that workloads have been generated, the resulting pattern requests are being fired and measurements taken.',
            [PHASES.VALUES.MEASUREMENT_EVALUATION]: 'After all requests have been sent, it is time to evaluated the metrics.',
            [PHASES.VALUES.COMPLETION]:
                'The benchmarking process is done. In case of manual evaluation, decide now whether you want the integration step to succeed or fail.'
        };

        return content[phaseName];
    }

    render() {
        const { phase } = this.props;
        const styles = {
            step: {
                cursor: 'pointer'
            }
        };
        return (
            <PaperContainer heading={'Current Phase of the Experiment'}>
                <Stepper activeStep={PHASES.ORDER.indexOf(phase)}>
                    {PHASES.ORDER.map(phaseName => (
                        <Step key={phaseName} completed={this.isCompleted(phaseName)} onClick={this.onChangeVisible(phaseName)} style={styles.step}>
                            <StepLabel>{this.getLabel(phaseName)}</StepLabel>
                        </Step>
                    ))}
                </Stepper>
                <p>{this.getContent(phase)}</p>
            </PaperContainer>
        );
    }
}
