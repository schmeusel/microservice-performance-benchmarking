export default class LoggingError extends Error {
    constructor(...args) {
        super(...args);
        Error.captureStackTrace(this, LoggingError);
    }
}
