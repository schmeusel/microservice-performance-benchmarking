export default class PatternResolverError extends Error {
    constructor(...args) {
        super(...args);
        Error.captureStackTrace(this, PatternResolverError);
    }
}
