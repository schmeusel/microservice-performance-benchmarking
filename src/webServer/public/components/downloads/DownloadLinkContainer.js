import React from 'react';
import PropTypes from 'prop-types';

const DownloadLinkContainer = ({ heading, children }) => {
    const styles = {
        container: {
            display: 'flex',
            flexDirection: 'column',
            marginBottom: 8,
            marginRight: 16,
        },
    };

    if (!children) {
        return null;
    }
    return (
        <div style={styles.container}>
            <h4>{heading}</h4>
            {children}
        </div>
    );
};

DownloadLinkContainer.propTypes = {
    heading: PropTypes.string.isRequired,
    children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
};

DownloadLinkContainer.defaultProps = {
    children: null,
};

export default DownloadLinkContainer;
