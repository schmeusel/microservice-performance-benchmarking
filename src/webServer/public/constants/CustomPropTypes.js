import PropTypes from 'prop-types';
import { PHASES } from './ApplicationConstants';

export const AsyncPropTypes = PropTypes.shape({
    isLoading: PropTypes.bool.isRequired,
    errorCode: PropTypes.number.isRequired,
});

export const ExperimentPhasePropTypes = PropTypes.oneOf(PHASES.ORDER);

export const ExperimentResultValuePropTypes = PropTypes.oneOf(['succeed', 'fail']);

export const ExperimentResultPropTypes = PropTypes.shape({
    value: ExperimentResultValuePropTypes.isRequired,
    async: AsyncPropTypes.isRequired,
});

export const MeasurementsPropTypes = PropTypes.shape({
    operation: PropTypes.oneOf(['READ', 'UPDATE', 'SCAN', 'DELETE', 'CREATE']).isRequired,
    latencies: PropTypes.shape({
        error: PropTypes.arrayOf(PropTypes.number).isRequired,
        success: PropTypes.arrayOf(PropTypes.number).isRequired,
    }).isRequired,
});

export const ApplicationSettingsPropTypes = PropTypes.shape({
    groupingDistance: PropTypes.number.isRequired,
});

export const PatternPropTypes = PropTypes.shape({
    name: PropTypes.string.isRequired,
    sequence: PropTypes.array.isRequired,
    amount: PropTypes.number.isRequired,
});
