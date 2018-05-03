import React from 'react';
import PropTypes from 'prop-types';
import { Paper, RaisedButton } from 'material-ui';
import { AsyncPropTypes } from '../constants/CustomPropTypes';
import ExperimentResultText from './ExperimentResultText';

const ExperimentResult = props => {
    const onDecide = result => () => {
        props.onDecide(result);
    };

    const styles = {
        container: {
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            marginBottom: 32
        },
        buttonContainer: {
            display: 'flex'
        },
        buttonStyle: {
            margin: 4,
            flex: 1
        }
    };

    const {
        result: { value, async }
    } = props;
    return (
        <Paper style={styles.container}>
            <h2>Decide on Result</h2>
            {
                <div style={styles.buttonContainer}>
                    {(!value || value === 'fail') && (
                        <RaisedButton
                            onClick={onDecide('succeed')}
                            disabled={async.isLoading || !!value}
                            secondary
                            label={value === 'fail' ? 'Failed' : 'Fail'}
                            style={styles.buttonStyle}
                        />
                    )}
                    {(!value || value === 'succeed') && (
                        <RaisedButton
                            onClick={onDecide('fail')}
                            disabled={async.isLoading || !!value}
                            primary
                            label={value === 'succeed' ? 'Succeeded' : 'Succeed'}
                            style={styles.buttonStyle}
                        />
                    )}
                </div>
            }
            <ExperimentResultText result={value} />
        </Paper>
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
