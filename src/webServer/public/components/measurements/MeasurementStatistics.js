import React from 'react';
import PropTypes from 'prop-types';
import MeasurementStatisticsElement from './MeasurementStatisticsElement';
import { Palette } from '../../constants/Theme';

const MeasurementStatistics = ({ measurements, type }) => {
    const styles = {
        paperContainer: {
            padding: 8,
            backgroundColor: type === 'success' ? Palette.primary1Color : Palette.accent1Color,
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
        },
        innerContainer: {
            display: 'flex',
        },
        heading: {
            marginTop: 0,
        },
    };
    if (!measurements.length) {
        return null;
    }
    return (
        <div style={styles.paperContainer}>
            {
                ['min', 'max', 'median', 'stdv', 'q1', 'q3'].map(stat => (
                    <MeasurementStatisticsElement
                        key={stat}
                        stat={stat}
                        measurements={measurements}
                    />
                ))
            }
        </div>
    );
};

MeasurementStatistics.propTypes = {
    type: PropTypes.oneOf(['success', 'error']).isRequired,
    measurements: PropTypes.arrayOf(PropTypes.number).isRequired,
};

export default MeasurementStatistics;
