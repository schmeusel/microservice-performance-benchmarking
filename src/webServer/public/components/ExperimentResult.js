import React from 'react';
import PropTypes from 'prop-types';
import { AsyncPropTypes } from '../constants/CustomPropTypes';

const ExperimentResult = props => {
    const onDecide = result => () => {
        props.onDecide(result);
    };

    const styles = {
        buttonContainer: {
            display: 'flex',
            flexDirection: 'column'
        }
    };

    const {
        result: { value, async }
    } = props;
    return (
        <div>
            {!!value && (
                <span>
                    Submitted result: <b>{value}</b>
                </span>
            )}
            {!value && (
                <div style={styles.buttonContainer}>
                    <h2>Decide on Result</h2>
                    <button onClick={onDecide('succeed')} disabled={async.isLoading}>
                        Succeed
                    </button>
                    <button onClick={onDecide('fail')} disabled={async.isLoading}>
                        Fail
                    </button>
                </div>
            )}
        </div>
    );
};

ExperimentResult.propTypes = {
    result: PropTypes.shape({
        value: PropTypes.string,
        async: AsyncPropTypes.isRequired
    }),
    onDecide: PropTypes.func.isRequired
};

export default ExperimentResult;
