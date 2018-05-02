import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { getExperimentStatus, decideOnResult, downloadLog } from '../actions/experimentActions';
import ExperimentPhase from '../components/ExperimentPhase';
import ExperimentResult from '../components/ExperimentResult';
import handleSocket from '../actions/socketActions';
import io from 'socket.io-client';
import SocketService from '../services/SocketService';
import LogsDownload from '../components/LogsDownload';
import { PHASES } from '../constants/ApplicationConstants';

class Layout extends PureComponent {
    componentDidMount() {
        SocketService.listen(this.props.handleSocket);
    }

    render() {
        return (
            <div>
                <ExperimentPhase phase={this.props.experimentPhase} />
                <ExperimentResult result={this.props.experimentResult} onDecide={this.props.decideOnResult} />
                {this.props.experimentPhase === PHASES.VALUES.COMPLETION && <LogsDownload />}
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
