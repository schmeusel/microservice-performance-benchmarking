import React from 'react';
import PropTypes from 'prop-types';
import { Bar } from 'react-chartjs-2';
import MeasurementsBoxPlot from './charts/MeasurementsBoxPlot';

const PatternMeasurement = props => {
    const { measurements, name } = props;
    const styles = {
        container: {
            display: 'flex',
            flexDirection: 'column',
            paddingTop: 16,
            flexWrap: 'wrap'
        }
    };

    return (
        <div style={styles.container}>
            <MeasurementsBoxPlot patternName={name} measurements={measurements} />
        </div>
    );
};

PatternMeasurement.propTypes = {
    name: PropTypes.string.isRequired,
    measurements: PropTypes.objectOf(
        PropTypes.shape({
            operation: PropTypes.oneOf(['READ', 'UPDATE', 'SCAN', 'DELETE', 'CREATE']).isRequired,
            latencies: PropTypes.shape({
                error: PropTypes.arrayOf(PropTypes.number).isRequired,
                success: PropTypes.arrayOf(PropTypes.number).isRequired
            }).isRequired
        })
    ).isRequired,
    total: PropTypes.number
};

export default PatternMeasurement;
