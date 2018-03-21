export type RequestMethod = 'GET' | 'PUT' | 'POST' |  'DELETE';

export interface PatternRequest {
	url: string,
	method: RequestMethod,
	auth?: object,
	headers?: object,
	body?: object,
	patternIndex: number,
	operationId: string,
	wait: number,
}