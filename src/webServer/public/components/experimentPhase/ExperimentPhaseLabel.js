import React from 'react';
import PropTypes from 'prop-types';
import {
    ActionBuild,
    ActionDoneAll,
    ActionHome,
    EditorShowChart,
    ImageTransform,
    NotificationNetworkCheck
} from 'material-ui/svg-icons';
import { IconButton } from 'material-ui';
import { PHASES } from '../../constants/ApplicationConstants';

const ExperimentPhaseLabel = ({ phase, completed, disabled }) => {
    function getHumanReadablePhaseName(phaseName) {
        return phaseName
            .split('_')
            .map(str => str.toLowerCase())
            .map(str => str.charAt(0).toUpperCase() + str.slice(1))
            .join(' ');
    }

    function getIcon(phaseName) {
        const icon = {
            [PHASES.VALUES.INITIALIZATON]: <ActionHome />,
            [PHASES.VALUES.PATTERN_RESOLUTION]: <ImageTransform />,
            [PHASES.VALUES.WORKLOAD_GENERATION]: <ActionBuild />,
            [PHASES.VALUES.REQUEST_TRANSMISSION]: <NotificationNetworkCheck />,
            [PHASES.VALUES.MEASUREMENT_EVALUATION]: <EditorShowChart />,
            [PHASES.VALUES.COMPLETION]: <ActionDoneAll />
        };
        const styles = {
            buttonStyle: {
                padding: 0,
                cursor: 'default',
                height: 24,
                width: 24
            }
        };
        return (
            <IconButton
                style={styles.buttonStyle}
                title={getHumanReadablePhaseName(phaseName)}
                iconStyle={styles.iconStyle}
                disableTouchRipple
                disabled={disabled}
            >
                {icon[phaseName]}
            </IconButton>
        );
    }

    if (disabled || completed) {
        return getIcon(phase);
    }
    return getHumanReadablePhaseName(phase);
};

ExperimentPhaseLabel.propTypes = {
    completed: PropTypes.bool.isRequired,
    disabled: PropTypes.bool.isRequired,
    phase: PropTypes.oneOf(PHASES.ORDER).isRequired
};

export default ExperimentPhaseLabel;
