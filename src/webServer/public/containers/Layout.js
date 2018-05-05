import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { grey100 } from 'material-ui/styles/colors';
import { getExperimentStatus, decideOnResult, downloadLog } from '../actions/experimentActions';
import ExperimentPhase from '../components/experimentPhase/ExperimentPhase';
import ExperimentResult from '../components/ExperimentResult';
import handleSocket from '../actions/socketActions';
import io from 'socket.io-client';
import SocketService from '../services/SocketService';
import Downloads from '../components/downloads/Downloads';
import { PHASES } from '../constants/ApplicationConstants';
import PatternMeasurementsContainer from '../components/measurements/PatternMeasurementsContainer';

class Layout extends PureComponent {
    componentDidMount() {
        SocketService.listen(this.props.handleSocket);
    }

    render() {
        const styles = {
            container: {
                padding: 32
            }
        };

        return (
            <div style={styles.container}>
                <h1>Performance Benchmark</h1>
                <ExperimentPhase phase={this.props.experimentPhase} />
                <PatternMeasurementsContainer measurements={this.props.measurements} />
                <ExperimentResult result={this.props.experimentResult} onDecide={this.props.decideOnResult} />
                <Downloads
                    patterns={this.props.patterns.map(pattern => pattern.name)}
                    phase={this.props.experimentPhase}
                />
            </div>
        );
    }
}

const length = 50;
const mapToRandom = () => parseFloat((Math.random() * 50 + 200).toFixed(2));
const patternNames = ['createResource', 'getItem', 'updateCreateRead', 'justDoIt'];
const buildRandomStepValues = () => ({
    operation: 'CREATE',
    latencies: {
        success: Array.from({ length }).map(mapToRandom),
        error: Array.from({ length }).map(mapToRandom)
    }
});
const measurements = patternNames.reduce((obj, name) => {
    return {
        ...obj,
        [name]: {
            0: buildRandomStepValues(),
            1: buildRandomStepValues(),
            2: buildRandomStepValues(),
            3: buildRandomStepValues(),
            4: buildRandomStepValues(),
            5: buildRandomStepValues()
        }
    };
}, {});

const mapStateToProps = state => ({
    // measurements: state.measurements,
    measurements: measurements,
    patterns: state.patterns,
    experimentPhase: state.experiment.phase,
    experimentResult: state.experiment.result
});

const mapDispatchToProps = dispatch => ({
    decideOnResult: result => dispatch(decideOnResult(result)),
    handleSocket: data => dispatch(handleSocket(data))
});

export default connect(mapStateToProps, mapDispatchToProps)(Layout);
