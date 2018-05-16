import React from 'react';
import PropTypes from 'prop-types';
import { CircularProgress } from 'material-ui';
import { Palette } from '../../constants/Theme';

const MeasurementProgress = ({ progress }) => {
    const styles = {
        progressContainer: {
            position: 'absolute',
            right: 16,
            top: 16,
        },
        text: {
            marginTop: 8,
        },
    };

    if (progress === 1) {
        return null;
    }

    console.log('progress', progress)
    return (
        <div style={styles.progressContainer}>
            <CircularProgress color={Palette.accent3Color} />
            {
                !!progress && <span style={styles.text}>{progress}</span>
            }
        </div>
    );
};

MeasurementProgress.propTypes = {
    progress: PropTypes.number,
};

MeasurementProgress.defaultProps = {
    progress: null,
};

export default MeasurementProgress;
