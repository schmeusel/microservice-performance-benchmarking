import React, { PureComponent } from 'react';
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

class Layout extends PureComponent {
    componentDidMount() {
        SocketService.listen(this.props.handleSocket);
    }

    render() {
        const styles = {
            container: {
                padding: 32,
            },
        };

        return (
            <div style={styles.container}>
                <h1>Performance Benchmark</h1>
                <ExperimentPhase phase={this.props.experiment.phase} />
                <PatternMeasurementsContainer
                    measurements={this.props.measurements}
                    groupingDistance={this.props.settings.groupingDistance}
                    onGroupingDistanceChange={this.props.onGroupingDistanceChange}
                />
                <ExperimentResult result={this.props.experiment.result} onDecide={this.props.decideOnResult} />
                <Downloads
                    patterns={this.props.patterns.map(pattern => pattern.name)}
                    phase={this.props.experiment.phase}
                />
                <FeedbackSnackbar message={this.props.feedbackMessage} />
            </div>
        );
    }
}

const length = 50;
const mapToRandom = () => parseFloat((Math.random() * 50 + 200).toFixed(2));
const patternNames = [ 'createResource', 'getItem', 'updateCreateRead', 'justDoIt' ];
const buildRandomStepValues = () => ({
    operation: 'CREATE',
    latencies: {
        success: Array.from({ length })
            .map(mapToRandom),
        error: Array.from({ length })
            .map(mapToRandom),
    },
});
const measurements = patternNames.reduce((obj, name) => {
    return {
        ...obj,
        [ name ]: {
            0: buildRandomStepValues(),
            1: buildRandomStepValues(),
            2: buildRandomStepValues(),
            3: buildRandomStepValues(),
            4: buildRandomStepValues(),
            5: buildRandomStepValues(),
        },
    };
}, {});

const mapStateToProps = state => ({
    // measurements: state.measurements,
    measurements: measurements,
    patterns: state.patterns,
    experiment: state.experiment,
    settings: state.application.settings,
    feedbackMessage: state.application.feedbackMessage,
});

const mapDispatchToProps = dispatch => ({
    decideOnResult: result => dispatch(decideOnResult(result)),
    handleSocket: data => dispatch(handleSocket(data)),
    onGroupingDistanceChange: value => dispatch(onGroupingDistanceChange(value)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Layout);
