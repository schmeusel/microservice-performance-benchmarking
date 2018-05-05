import React from 'react';
import PropTypes from 'prop-types';
import { Bar } from 'react-chartjs-2';
import MeasurementsBoxPlot from './charts/MeasurementsBoxPlot';
import MeasurementsHistogram from './charts/MeasurementsHistogram';
import { MeasurementsPropTypes } from '../../constants/CustomPropTypes';

const PatternMeasurement = props => {
    const { measurements, name } = props;
    const styles = {
        container: {
            display: 'flex',
            flexDirection: 'column',
            paddingTop: 12,
            flexWrap: 'wrap'
        },
        histogramContainer: {
            display: 'flex',
            flexWrap: 'wrap'
        }
    };

    return (
        <div style={styles.container}>
            <h4>Box Plots</h4>
            <MeasurementsBoxPlot patternName={name} measurements={measurements} />
            <h4>Histograms</h4>
            <div style={styles.histogramContainer}>
                {Object.keys(measurements)
                    // .slice(0, 1)
                    .map(seqIndex => {
                        return (
                            <MeasurementsHistogram
                                key={`${name}_${seqIndex}`}
                                name={name}
                                sequenceIndex={parseInt(seqIndex)}
                                measurements={measurements[seqIndex]}
                                groupingDistance={2}
                            />
                        );
                    })}
            </div>
        </div>
    );
};

PatternMeasurement.propTypes = {
    name: PropTypes.string.isRequired,
    measurements: PropTypes.objectOf(MeasurementsPropTypes).isRequired,
    total: PropTypes.number
};

export default PatternMeasurement;
