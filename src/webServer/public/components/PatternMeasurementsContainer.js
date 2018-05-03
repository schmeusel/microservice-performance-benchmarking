import React from 'react';
import PropTypes from 'prop-types';
import { Paper } from 'material-ui';
import PatternMeasurement from './PatternMeasurement';

const PatternMeasurementsContainer = ({ measurements }) => {
    const styles = {
        container: {
            display: 'flex',
            flexDirection: 'column',
            padding: 16,
            marginBottom: 32
        }
    };

    if (!Object.keys(measurements).length) {
        return null;
    }
    console.group('CONTAINER');
    console.log('measurements in container', measurements);
    console.groupEnd('CONTAINER');
    return (
        <Paper style={styles.container}>
            <h2>Pattern Measurements</h2>
            {Object.keys(measurements).map(patternName => <PatternMeasurement key={patternName} name={patternName} measurements={measurements[patternName]} />)}
        </Paper>
    );
};

PatternMeasurementsContainer.propTypes = {
    measurements: PropTypes.objectOf(
        PropTypes.objectOf(
            PropTypes.shape({
                operation: PropTypes.oneOf(['READ', 'UPDATE', 'SCAN', 'DELETE', 'CREATE']).isRequired,
                latencies: PropTypes.shape({
                    error: PropTypes.arrayOf(PropTypes.number).isRequired,
                    success: PropTypes.arrayOf(PropTypes.number).isRequired
                }).isRequired
            })
        )
    )
};

export default PatternMeasurementsContainer;
