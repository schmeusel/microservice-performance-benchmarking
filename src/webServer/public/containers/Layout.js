import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { getExperimentStatus, decideOnResult } from '../actions/experimentActions';
import ExperimentStatus from '../components/ExperimentStatus';
import ExperimentDecision from '../components/ExperimentDecision';
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
                <ExperimentDecision decision={this.props.ExperimentDecision} />
            </div>
        );
    }
}

const mapStateToProps = state => ({
    measurements: state.measurements,
    experimentStatus: state.experimentStatus,
    experimentDecision: state.experimentDecision
});

const mapDispatchToProps = dispatch => ({
    getStatus: () => dispatch(getExperimentStatus()),
    decideOnResult: result => dispatch(decideOnResult(result)),
    handleSocket: data => dispatch(handleSocket(data))
});

export default connect(mapStateToProps, mapDispatchToProps)(Layout);
