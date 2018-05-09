import React from 'react';
import PropTypes from 'prop-types';
import { Tabs, Tab } from 'material-ui';
import PatternMeasurement from './PatternMeasurement';
import PaperContainer from '../../containers/PaperContainer';
import { grey200 } from 'material-ui/styles/colors';
import { Palette } from '../../constants/Theme';
import { MeasurementsPropTypes } from '../../constants/CustomPropTypes';

const PatternMeasurementsContainer = ({ measurements, groupingDistance, onGroupingDistanceChange }) => {
    if (!Object.keys(measurements).length) {
        return null;
    }
    const styles = {
        inkBar: {
            backgroundColor: Palette.accent3Color,
        },
        tabButton: {
            backgroundColor: 'white',
            color: 'black',
            borderBottom: `2px solid ${grey200}`,
            textTransform: 'none',
        },
    };
    return (
        <PaperContainer heading={'Pattern Measurements'}>
            <Tabs inkBarStyle={styles.inkBar}>
                {Object.keys(measurements).map(patternName => (
                    <Tab key={patternName} label={patternName} buttonStyle={styles.tabButton}>
                        <PatternMeasurement
                            name={patternName}
                            measurements={measurements[patternName]}
                            groupingDistance={groupingDistance}
                            onGroupingDistanceChange={onGroupingDistanceChange}
                        />
                    </Tab>
                ))}
            </Tabs>
        </PaperContainer>
    );
};

PatternMeasurementsContainer.propTypes = {
    measurements: PropTypes.objectOf(PropTypes.objectOf(MeasurementsPropTypes)),
    groupingDistance: PropTypes.number.isRequired,
    onGroupingDistanceChange: PropTypes.func.isRequired,
};

export default PatternMeasurementsContainer;
