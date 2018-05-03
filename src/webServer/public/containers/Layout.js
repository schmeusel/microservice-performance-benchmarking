import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { grey100 } from 'material-ui/styles/colors';
import { getExperimentStatus, decideOnResult, downloadLog } from '../actions/experimentActions';
import ExperimentPhase from '../components/ExperimentPhase';
import ExperimentResult from '../components/ExperimentResult';
import handleSocket from '../actions/socketActions';
import io from 'socket.io-client';
import SocketService from '../services/SocketService';
import LogsDownload from '../components/LogsDownload';
import { PHASES } from '../constants/ApplicationConstants';
import PatternMeasurementsContainer from '../components/PatternMeasurementsContainer';

class Layout extends PureComponent {
    componentDidMount() {
        SocketService.listen(this.props.handleSocket);
    }

    render() {
        const styles = {
            container: {
                padding: 32
                // backgroundColor: grey100,
                // height: '100%'
            }
        };
        return (
            <div style={styles.container}>
                <h1>Performance Benchmark</h1>
                <ExperimentPhase phase={this.props.experimentPhase} />
                <ExperimentResult result={this.props.experimentResult} onDecide={this.props.decideOnResult} />
                <PatternMeasurementsContainer measurements={this.props.measurements} />
                <LogsDownload isReady={this.props.experimentPhase === PHASES.VALUES.COMPLETION} />
            </div>
        );
    }
}

const mapStateToProps = state => ({
    measurements: state.measurements,
    experimentPhase: state.experiment.phase,
    experimentResult: state.experiment.result
});

const mapDispatchToProps = dispatch => ({
    decideOnResult: result => dispatch(decideOnResult(result)),
    handleSocket: data => dispatch(handleSocket(data))
});

export default connect(mapStateToProps, mapDispatchToProps)(Layout);
