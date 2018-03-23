export default class StorageError extends Error {
    constructor(...args) {
        super(...args);
        Error.captureStackTrace(this, StorageError);
    }
}
