import React from 'react';
import PropTypes from 'prop-types';
import PaperContainer from '../../containers/PaperContainer';
import EndpointConstants from '../../constants/EndpointConstants';
import DownloadLinkContainer from './DownloadLinkContainer';
import { PHASES } from '../../constants/ApplicationConstants';

const Downloads = ({ patterns, phase }) => {
    const styles = {
        linksContainer: {
            display: 'flex',
            flexWrap: 'wrap'
        }
    };
    return (
        <PaperContainer heading={'Downloads'}>
            <div style={styles.linksContainer}>
                <DownloadLinkContainer heading={'Events'}>
                    <a href={EndpointConstants.DOWNLOAD_LOG.path('systemEvents')}>systemEvents.log</a>
                </DownloadLinkContainer>
                {PHASES.ORDER.indexOf(phase) > PHASES.ORDER.indexOf(PHASES.VALUES.WORKLOAD_GENERATION) && (
                    <DownloadLinkContainer heading={'Workloads'}>
                        {patterns.map(patternName => (
                            <a key={patternName} href={EndpointConstants.DOWNLOAD_WORKLOAD.path(patternName)}>
                                {patternName}.log
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
    phase: PropTypes.oneOf(PHASES.ORDER),
    patterns: PropTypes.arrayOf(PropTypes.string)
};

Downloads.defaultProps = {
    patterns: []
};

export default Downloads;