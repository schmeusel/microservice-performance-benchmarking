export default class SwaggerError extends Error {
	constructor(...args) {
		super(...args);
		Error.captureStackTrace(this, SwaggerError);
	}
}