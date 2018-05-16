import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { decideOnResult } from '../actions/experimentActions';
import { onGroupingDistanceChange } from '../actions/applicationActions';
import ExperimentPhase from '../components/experimentPhase/ExperimentPhase';
import ExperimentResult from '../components/ExperimentResult';
import { handleSocket } from '../actions/socketActions';
import SocketService from '../services/SocketService';
import Downloads from '../components/downloads/Downloads';
import PatternMeasurementsContainer from '../components/measurements/PatternMeasurementsContainer';
import FeedbackSnackbar from '../components/FeedbackSnackbar';
import {
    ApplicationSettingsPropTypes,
    ExperimentPhasePropTypes,
    ExperimentResultPropTypes,
    MeasurementsPropTypes, PatternPropTypes,
} from '../constants/CustomPropTypes';
import { fetchAllMeasurements } from '../actions/measurementsActions';
import { PHASES } from '../constants/ApplicationConstants';

class Layout extends PureComponent {
    static propTypes = {
        handleSocket: PropTypes.func.isRequired,
        onGroupingDistanceChange: PropTypes.func.isRequired,
        fetchAllMeasurements: PropTypes.func.isRequired,
        decideOnResult: PropTypes.func.isRequired,
        experiment: PropTypes.shape({
            phase: ExperimentPhasePropTypes.isRequired,
            result: ExperimentResultPropTypes.isRequired,
        }).isRequired,
        measurements: MeasurementsPropTypes.isRequired,
        patterns: PropTypes.arrayOf(PatternPropTypes).isRequired,
        settings: ApplicationSettingsPropTypes.isRequired,
        feedbackMessage: PropTypes.string.isRequired,
    };

    componentDidMount() {
        SocketService.listen(this.props.handleSocket);
    }

    componentWillReceiveProps(nextProps) {
        const notCompletedBefore = this.props.experiment.phase !== PHASES.VALUES.COMPLETION;
        const completedNow = nextProps.experiment.phase === PHASES.VALUES.COMPLETION;
        if (notCompletedBefore && completedNow) {
            this.props.fetchAllMeasurements();
        }
    }

    getProgress() {
        const { patterns } = this.props;
        const totalRequests = patterns.reduce((amount, pattern) => pattern.total + amount, 0);
        const patternProgress = patterns.reduce((weightedSum, pattern) => weightedSum + (pattern.total * (pattern.progress || 0)), 0) / totalRequests;
        const hasFinishedWithRequests = PHASES.ORDER.indexOf(this.props.experiment.phase) > PHASES.ORDER.indexOf(PHASES.VALUES.REQUEST_TRANSMISSION);
        return hasFinishedWithRequests ? 1 : patternProgress;
    }

    render() {
        const styles = {
            container: {
                padding: 32,
                maxWidth: 768,
                marginLeft: 'auto',
                marginRight: 'auto',
            },
        };



        return (
            <div style={styles.container}>
                <h1>Performance Benchmark</h1>
                <ExperimentPhase phase={this.props.experiment.phase} />
                <ExperimentResult
                    result={this.props.experiment.result}
                    onDecide={this.props.decideOnResult}
                />
                <PatternMeasurementsContainer
                    patterns={this.props.patterns}
                    progress={this.getProgress()}
                    measurements={this.props.measurements.values}
                    groupingDistance={this.props.settings.groupingDistance}
                    onGroupingDistanceChange={this.props.onGroupingDistanceChange}
                    isFetching={this.props.measurements.async.isLoading}
                />
                <Downloads
                    patterns={this.props.patterns}
                    phase={this.props.experiment.phase}
                />
                <FeedbackSnackbar message={this.props.feedbackMessage} />
            </div>
        );
    }
}

const mapStateToProps = state => ({
    measurements: state.measurements,
    patterns: state.patterns,
    experiment: state.experiment,
    settings: state.application.settings,
    feedbackMessage: state.application.feedbackMessage,
});

const mapDispatchToProps = dispatch => ({
    decideOnResult: result => dispatch(decideOnResult(result)),
    handleSocket: data => dispatch(handleSocket(data)),
    onGroupingDistanceChange: value => dispatch(onGroupingDistanceChange(value)),
    fetchAllMeasurements: () => dispatch(fetchAllMeasurements()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Layout);
