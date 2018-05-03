import React from 'react';
import PropTypes from 'prop-types';
import { Line } from 'react-chartjs-2';

const PatternMeasurement = props => {
    const { measurements, name } = props;
    const styles = {
        container: {
            display: 'flex',
            flexDirection: 'column'
        }
    };
    const latencyRow = Object.keys(Object.keys(measurements).map(index => measurements[index].latencies)).reduce((latencies, errOrSucc, arr) => [
        ...latencies,
        ...arr[errOrSucc]
    ]);
    console.log('latency row', latencyRow);
    const data = {
        datasets: [
            {
                label: 'success',
                fillColor: 'rgba(220,220,220,0.2)',
                strokeColor: 'rgba(220,220,220,1)',
                pointColor: 'rgba(220,220,220,1)',
                pointStrokeColor: '#fff',
                pointHighlightFill: '#fff',
                pointHighlightStroke: 'rgba(220,220,220,1)',
                data: latencyRow
            }
        ]
    };
    return (
        <div style={styles.container}>
            <h4>{name}</h4>
            <Line data={data} />
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
