const apiPrefix = '/api/v1';
export default {
    STATUS: `${apiPrefix}/status`,
    DECISION: result => `${apiPrefix}/end/${result}`
};
