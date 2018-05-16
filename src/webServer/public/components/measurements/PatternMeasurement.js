import React from 'react';
import PropTypes from 'prop-types';
import MeasurementsBoxPlot from './charts/MeasurementsBoxPlot';
import MeasurementsHistogramContainer from './MeasurementsHistogramContainer';
import { MeasurementsPropTypes } from '../../constants/CustomPropTypes';
import MeasurementStatistics from './MeasurementStatistics';

const PatternMeasurement = (props) => {
    const {
        measurements, name, groupingDistance, onGroupingDistanceChange,
    } = props;
    const styles = {
        container: {
            display: 'flex',
            flexDirection: 'column',
            paddingTop: 12,
            flexWrap: 'wrap',
        },
    };

    const successMeasurements = Object.keys(measurements)
        .map(step => measurements[step].latencies)
        .reduce((latencies, errAndSuccess) => [...latencies, ...errAndSuccess.success], []);
    const errorMeasurements = Object.keys(measurements)
        .map(step => measurements[step].latencies)
        .reduce((latencies, errAndSuccess) => [...latencies, ...errAndSuccess.error], []);

    return (
        <div style={styles.container}>
            <MeasurementStatistics measurements={successMeasurements} type={'success'} />
            <MeasurementStatistics measurements={errorMeasurements} type={'error'} />
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
};

export default PatternMeasurement;
