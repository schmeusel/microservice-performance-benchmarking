import React from 'react';
import PropTypes from 'prop-types';
import { IconButton, Slider } from 'material-ui';
import { ActionSettings } from 'material-ui/svg-icons';

const HistogramGroupingDistance = props => {
    const styles = {
        container: {
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            marginBottom: 12
        },
        slider: {
            marginBottom: 8,
            marginTop: 8
        },
        text: {
            fontSize: '0.8rem'
        }
    };

    const onGroupingDistanceChange = (e, value) => {
        props.onGroupingDistanceChange(value);
    };
    return (
        <div style={styles.container}>
            <Slider
                min={2}
                max={10}
                step={1}
                onChange={onGroupingDistanceChange}
                value={props.groupingDistance}
                sliderStyle={styles.slider}
            />
            <span style={styles.text}>
                Requests within <b>{props.groupingDistance}ms</b> are grouped under the same bar.
            </span>
        </div>
    );
};

HistogramGroupingDistance.propTypes = {
    groupingDistance: PropTypes.number.isRequired,
    onGroupingDistanceChange: PropTypes.func.isRequired
};

export default HistogramGroupingDistance;
