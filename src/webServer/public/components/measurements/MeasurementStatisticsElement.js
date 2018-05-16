import React from 'react';
import PropTypes from 'prop-types';
import * as stats from 'simple-statistics';

const MeasurementStatisticsElement = ({ stat, measurements }) => {
    const styles = {
        container: {
            display: 'flex',
            fontSize: '0.7rem',
        },
        heading: {
            fontWeight: 600,
            marginRight: 8,
        },
    };

    const calculateStat = {
        min: () => stats.min(measurements),
        max: () => stats.max(measurements),
        mean: () => stats.mean(measurements),
        stdv: () => stats.standardDeviation(measurements),
        q1: () => stats.quantile(measurements, 0.25),
        q3: () => stats.quantile(measurements, 0.75),
    };

    return (
        <div style={styles.container}>
            <span style={styles.heading}>{stat.toUpperCase()}</span>
            <span>{calculateStat[stat]().toFixed(2)}ms</span>
        </div>
    );
};

MeasurementStatisticsElement.propTypes = {
    stat: PropTypes.string.isRequired,
    measurements: PropTypes.arrayOf(PropTypes.number).isRequired,
};

export default MeasurementStatisticsElement;
