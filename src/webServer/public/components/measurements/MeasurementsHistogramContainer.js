import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import MeasurementsHistogram from './charts/MeasurementsHistogram';
import HistogramGroupingDistance from './HistogramGroupingDistance';

const MeasurementsHistogramContainer = ({ groupingDistance, onGroupingDistanceChange, measurements, name }) => {
    const styles = {
        histogramContainer: {
            display: 'flex',
            flexWrap: 'wrap'
        }
    };
    return (
        <Fragment>
            <h4>Histograms</h4>
            <div style={styles.histogramContainer}>
                <HistogramGroupingDistance
                    groupingDistance={groupingDistance}
                    onGroupingDistanceChange={onGroupingDistanceChange}
                />
                {Object.keys(measurements).map(seqIndex => {
                    return (
                        <MeasurementsHistogram
                            key={`${name}_${seqIndex}`}
                            name={name}
                            sequenceIndex={parseInt(seqIndex)}
                            measurements={measurements[seqIndex]}
                            groupingDistance={groupingDistance}
                        />
                    );
                })}
            </div>
        </Fragment>
    );
};

MeasurementsHistogramContainer.propTypes = {};

export default MeasurementsHistogramContainer;
