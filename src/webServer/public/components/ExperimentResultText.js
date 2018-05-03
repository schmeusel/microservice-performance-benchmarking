import React from 'react';
import PropTypes from 'prop-types';

const ExperimentResultText = ({ result }) => {
    function getResultText() {
        switch (result) {
            case 'fail':
                return 'After manually failing the experiment, the server has been shut down. Logs can still be accessed manually on the benchmark instance.';
            case 'succeed':
                return 'After manually succeeding the experiment, the server has been shut down. Logs can still be accessed manually on the benchmark instance.';
        }
    }
    if (!result) {
        return null;
    }

    return <p>{getResultText()}</p>;
};

ExperimentResultText.propTypes = {
    result: PropTypes.oneOf(['fail', 'succeed'])
};

export default ExperimentResultText;
