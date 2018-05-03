import React from 'react';
import PropTypes from 'prop-types';
import { Paper } from 'material-ui';
import EndpointConstants from '../constants/EndpointConstants';

const LogsDownload = () => {
    const styles = {
        container: {
            display: 'flex',
            flexDirection: 'column',
            padding: 16
        },
        linkContainer: {
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
        }
    };
    return (
        <Paper style={styles.container}>
            <h2>Logs</h2>
            <div style={styles.linkContainer}>
                <a href={EndpointConstants.DOWNLOAD_LOG.path('measurements')}>Download raw measurements</a>
                <a href={EndpointConstants.DOWNLOAD_LOG.path('systemEvents')}>Download system event log</a>
            </div>
        </Paper>
    );
};

LogsDownload.propTypes = {
    isReady: PropTypes.bool.isRequired
};

export default LogsDownload;
