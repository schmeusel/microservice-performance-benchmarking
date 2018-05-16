import React from 'react';
import PropTypes from 'prop-types';
import PaperContainer from '../../containers/PaperContainer';
import EndpointConstants from '../../constants/EndpointConstants';
import DownloadLinkContainer from './DownloadLinkContainer';
import { PHASES } from '../../constants/ApplicationConstants';
import { ExperimentPhasePropTypes, PatternPropTypes } from '../../constants/CustomPropTypes';

const Downloads = ({ patterns, phase }) => {
    const styles = {
        linksContainer: {
            display: 'flex',
            flexWrap: 'wrap',
        },
    };
    return (
        <PaperContainer heading={'Downloads'}>
            <div style={styles.linksContainer}>
                <DownloadLinkContainer heading={'Events'}>
                    <a href={EndpointConstants.DOWNLOAD_LOG.path('systemEvents')}>systemEvents.log</a>
                </DownloadLinkContainer>
                {PHASES.ORDER.indexOf(phase) > PHASES.ORDER.indexOf(PHASES.VALUES.WORKLOAD_GENERATION) && (
                    <DownloadLinkContainer heading={'Workloads'}>
                        {patterns.map(pattern => (
                            <a key={pattern.name} href={EndpointConstants.DOWNLOAD_WORKLOAD.path(pattern.name)}>
                                {pattern.name}.workload
                            </a>
                        ))}
                    </DownloadLinkContainer>
                )}
                {PHASES.ORDER.indexOf(phase) > PHASES.ORDER.indexOf(PHASES.VALUES.REQUEST_TRANSMISSION) && (
                    <DownloadLinkContainer heading={'Measurements'}>
                        <a href={EndpointConstants.DOWNLOAD_LOG.path('measurements')}>measurements.log</a>
                    </DownloadLinkContainer>
                )}
            </div>
        </PaperContainer>
    );
};

Downloads.propTypes = {
    phase: ExperimentPhasePropTypes.isRequired,
    patterns: PropTypes.arrayOf(PatternPropTypes).isRequired,
};

export default Downloads;
