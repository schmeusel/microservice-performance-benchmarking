import React from 'react';
import PropTypes from 'prop-types';
import { Bar } from 'react-chartjs-2';
import MeasurementsBoxPlot from './charts/MeasurementsBoxPlot';
import MeasurementsHistogramContainer from './MeasurementsHistogramContainer';
import { MeasurementsPropTypes } from '../../constants/CustomPropTypes';

const PatternMeasurement = props => {
    const { measurements, name, groupingDistance, onGroupingDistanceChange } = props;
    const styles = {
        container: {
            display: 'flex',
            flexDirection: 'column',
            paddingTop: 12,
            flexWrap: 'wrap'
        }
    };

    return (
        <div style={styles.container}>
            <MeasurementsBoxPlot patternName={name} measurements={measurements} />
            <MeasurementsHistogramContainer
                name={name}
                measurements={measurements}
                groupingDistance={groupingDistance}
                onGroupingDistanceChange={onGroupingDistanceChange}
            />
        </div>
    );
};

PatternMeasurement.propTypes = {
    name: PropTypes.string.isRequired,
    measurements: PropTypes.objectOf(MeasurementsPropTypes).isRequired,
    groupingDistance: PropTypes.number.isRequired,
    onGroupingDistanceChange: PropTypes.func.isRequired,
    total: PropTypes.number
};

export default PatternMeasurement;
