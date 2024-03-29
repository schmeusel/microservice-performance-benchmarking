import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { CircularProgress, Paper } from 'material-ui';
import MeasurementProgress from '../components/measurements/MeasurementProgress';

const PaperContainer = ({
    heading, children, style, isLoading, loadingLabel, withProgress, progress,
}) => {
    const styles = {
        paperStyle: {
            padding: 16,
            marginBottom: 32,
            display: 'flex',
            flexDirection: 'column',
            position: withProgress ? 'relative' : null,
            ...style,
        },
        spinnerContainer: {
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'column',
        },
        loadingLabel: {
            marginTop: 8,
        },

    };

    if (!children) {
        return null;
    }
    return (
        <Paper style={styles.paperStyle} zDepth={0}>
            {
                !isLoading && withProgress && (
                    <MeasurementProgress progress={progress} />
                )
            }
            {
                isLoading
                    ? (
                        <div style={styles.spinnerContainer}>
                            <CircularProgress />
                            {!!loadingLabel && (
                                <span style={styles.loadingLabel}>{loadingLabel}</span>
                            )}
                        </div>
                    )
                    : (
                        <Fragment>
                            {!!heading && <h2>{heading}</h2>}
                            {children}
                        </Fragment>
                    )
            }
        </Paper>
    );
};

PaperContainer.propTypes = {
    children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
    isLoading: PropTypes.bool,
    heading: PropTypes.string.isRequired,
    style: PropTypes.object,
    loadingLabel: PropTypes.string,
    withProgress: PropTypes.bool,
    progress: PropTypes.number,
};

PaperContainer.defaultProps = {
    style: {},
    isLoading: false,
    loadingLabel: '',
    withProgress: false,
    progress: 0,
};

export default PaperContainer;
