import React from 'react';
import PropTypes from 'prop-types';
import { RaisedButton } from 'material-ui';
import { ExperimentResultPropTypes } from '../constants/CustomPropTypes';
import ExperimentResultText from './ExperimentResultText';
import PaperContainer from '../containers/PaperContainer';

const ExperimentResult = (props) => {
    const onDecide = result => () => {
        props.onDecide(result);
    };

    const styles = {
        buttonContainer: {
            display: 'flex',
        },
        buttonStyle: {
            margin: 4,
            flex: 1,
        },
    };

    const {
        result: { value, async },
    } = props;
    return (
        <PaperContainer heading={'Decide on Result'}>
            {
                <div style={styles.buttonContainer}>
                    {(!value || value === 'fail') && (
                        <RaisedButton
                            onClick={onDecide('fail')}
                            disabled={async.isLoading || !!value}
                            secondary
                            label={value === 'fail' ? 'Experiment Failed' : 'Fail'}
                            style={styles.buttonStyle}
                        />
                    )}
                    {(!value || value === 'succeed') && (
                        <RaisedButton
                            onClick={onDecide('succeed')}
                            disabled={async.isLoading || !!value}
                            primary
                            label={value === 'succeed' ? 'Experiment Succeeded' : 'Succeed'}
                            style={styles.buttonStyle}
                        />
                    )}
                </div>
            }
            <ExperimentResultText result={value} />
        </PaperContainer>
    );
};

ExperimentResult.propTypes = {
    result: ExperimentResultPropTypes.isRequired,
    onDecide: PropTypes.func.isRequired,
};

export default ExperimentResult;
