import React from 'react';
import PropTypes from 'prop-types';
import { Paper } from 'material-ui';

const PaperContainer = ({ heading, children, style }) => {
    const paperStyle = {
        padding: 16,
        marginBottom: 32,
        display: 'flex',
        flexDirection: 'column',
        ...style
    };

    if (!children) {
        return null;
    }
    return (
        <Paper style={paperStyle}>
            {!!heading && <h2>{heading}</h2>}
            {children}
        </Paper>
    );
};

PaperContainer.propTypes = {
    children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
    heading: PropTypes.string,
    style: PropTypes.object
};

PaperContainer.defaultProps = {
    style: {}
};

export default PaperContainer;
