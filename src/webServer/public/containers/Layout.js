import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { getExperimentStatus, decideOnResult } from '../actions/experimentActions';
import ExperimentStatus from '../components/ExperimentStatus';
import ExperimentResult from '../components/ExperimentResult';
import handleSocket from '../actions/socketActions';
import io from 'socket.io-client';
import SocketService from '../services/SocketService';

class Layout extends PureComponent {
    componentDidMount() {
        this.props.getStatus();
        SocketService.listen(this.props.handleSocket);
    }

    render() {
        return (
            <div>
                <ExperimentStatus status={this.props.experimentStatus} />
                <ExperimentResult result={this.props.experimentResult} onDecide={this.props.decideOnResult} />
            </div>
        );
    }
}

const mapStateToProps = state => ({
    measurements: state.measurements,
    experimentStatus: state.experiment.status,
    experimentResult: state.experiment.result
});

const mapDispatchToProps = dispatch => ({
    getStatus: () => dispatch(getExperimentStatus()),
    decideOnResult: result => dispatch(decideOnResult(result)),
    handleSocket: data => dispatch(handleSocket(data))
});

export default connect(mapStateToProps, mapDispatchToProps)(Layout);
