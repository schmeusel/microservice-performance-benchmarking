import React from 'react';
import PropTypes from 'prop-types';
import EndpointConstants from '../constants/EndpointConstants';

export default () => {
    const styles = {
        container: {
            display: 'flex',
            flexDirection: 'column'
        }
    };
    return (
        <div style={styles.container}>
            <h2>Logs</h2>
            <a href={EndpointConstants.DOWNLOAD_LOG.path('measurements')}>Download raw measurements</a>
            <a href={EndpointConstants.DOWNLOAD_LOG.path('systemEvents')}>Download system event log</a>
        </div>
    );
};
