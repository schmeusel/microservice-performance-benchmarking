export default class OpenAPIError extends Error {
	constructor(...args) {
		super(...args);
		Error.captureStackTrace(this, OpenAPIError);
	}
}