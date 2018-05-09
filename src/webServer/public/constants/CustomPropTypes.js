import PropTypes from 'prop-types';

export const AsyncPropTypes = PropTypes.shape({
    isLoading: PropTypes.bool.isRequired,
    errorCode: PropTypes.number.isRequired,
});

export const StatsPropTypes = PropTypes.objectOf(
    PropTypes.shape({
        round: PropTypes.number,
        total: PropTypes.number,
    }),
);

export const MeasurementsPropTypes = PropTypes.shape({
    operation: PropTypes.oneOf(['READ', 'UPDATE', 'SCAN', 'DELETE', 'CREATE']).isRequired,
    latencies: PropTypes.shape({
        error: PropTypes.arrayOf(PropTypes.number).isRequired,
        success: PropTypes.arrayOf(PropTypes.number).isRequired,
    }).isRequired,
});
