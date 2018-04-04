export default class EvaluationError extends Error {
    constructor(...args) {
        super(...args);
        Error.captureStackTrace(this, EvaluationError);
    }
}
