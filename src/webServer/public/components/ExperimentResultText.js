import React from 'react';
import { ExperimentResultValuePropTypes } from '../constants/CustomPropTypes';

const ExperimentResultText = ({ result }) => {
    function getResultText() {
        switch (result) {
            case 'fail':
                return 'After manually failing the experiment, the server has been shut down. Logs can still be accessed manually on the benchmark instance.';
            case 'succeed':
                return 'After manually succeeding the experiment, the server has been shut down. Logs can still be accessed manually on the benchmark instance.';
        }
        throw new Error(`Result has to be one of "fail" or "succeed". Provided was "${result}"`);
    }

    if (!result) {
        return null;
    }

    return <p>{getResultText()}</p>;
};

ExperimentResultText.propTypes = {
    result: ExperimentResultValuePropTypes,
};

ExperimentResultText.defaultProps = {
    result: null,
};

export default ExperimentResultText;
