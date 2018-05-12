import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Snackbar } from 'material-ui';

export default class FeedbackSnackbar extends PureComponent {
    static propTypes = {
        message: PropTypes.string,
    };

    static defaultProps = {
        message: '',
    };

    state = {
        open: false,
    };

    componentWillReceiveProps(nextProps) {
        if (nextProps.message !== this.props.message) {
            this.setState({
                open: true,
            });
        }
    }

    onRequestClose = () => {
        this.setState({
            open: false,
        });
    };

    render() {
        return (
            <Snackbar
                open={this.state.open && !!this.props.message}
                onRequestClose={this.onRequestClose}
                message={this.props.message}
                autoHideDuration={4000}
            />
        );
    }
}
