export default class MeasurementResultError extends Error {
    constructor(...args) {
        super(...args);
        Error.captureStackTrace(this, MeasurementResultError);
    }
}
