const apiPrefix = '/api/v1';
export default {
    STATUS: {
        method: 'get',
        path: `${apiPrefix}/status`,
    },
    DECISION: {
        method: 'post',
        path: result => `${apiPrefix}/end/${result}`,
    },
    DOWNLOAD_LOG: {
        method: 'get',
        path: type => `${apiPrefix}/logs?type=${type}`,
    },
    DOWNLOAD_WORKLOAD: {
        method: 'get',
        path: pattern => `${apiPrefix}/logs/workloads?pattern=${pattern}`,
    },
};
