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
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            fontSize: '0.7rem',
        },
        text: {
            marginTop: 8,
        },
    };

    if (progress === 1) {
        return null;
    }

    return (
        <div style={styles.progressContainer}>
            <CircularProgress
                color={Palette.accent3Color}
                size={35}
                mode={progress ? 'determinate' : 'indeterminate'}
                value={progress * 100 || null}
            />
            {
                !!progress && <span style={styles.text}>{Math.round(progress * 100)}%</span>
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
