import PropTypes from 'prop-types';

export const AsyncPropTypes = PropTypes.shape({
    isLoading: PropTypes.bool.isRequired,
    errorCode: PropTypes.number.isRequired
});

export const StatsPropTypes = PropTypes.objectOf(
    PropTypes.shape({
        round: PropTypes.number,
        total: PropTypes.number
    })
);
