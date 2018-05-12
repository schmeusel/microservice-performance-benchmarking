import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import MeasurementsHistogram from './charts/MeasurementsHistogram';
import HistogramGroupingDistance from './HistogramGroupingDistance';
import { MeasurementsPropTypes } from '../../constants/CustomPropTypes';

const MeasurementsHistogramContainer = ({
    groupingDistance, onGroupingDistanceChange, measurements, name,
}) => {
    const styles = {
        histogramContainer: {
            display: 'flex',
            flexWrap: 'wrap',
        },
    };
    return (
        <Fragment>
            <h4>Histograms</h4>
            <div style={styles.histogramContainer}>
                <HistogramGroupingDistance
                    groupingDistance={groupingDistance}
                    onGroupingDistanceChange={onGroupingDistanceChange}
                />
                {Object.keys(measurements)
                    .map(seqIndex => (
                        <MeasurementsHistogram
                            key={`${name}_${seqIndex}`}
                            name={name}
                            sequenceIndex={parseInt(seqIndex)}
                            measurements={measurements[seqIndex]}
                            groupingDistance={groupingDistance}
                        />
                    ))}
            </div>
        </Fragment>
    );
};

MeasurementsHistogramContainer.propTypes = {
    groupingDistance: PropTypes.number.isRequired,
    onGroupingDistanceChange: PropTypes.func.isRequired,
    measurements: PropTypes.objectOf(MeasurementsPropTypes).isRequired,
    name: PropTypes.string.isRequired,
};

export default MeasurementsHistogramContainer;
