export interface PatternRequestMeasurement {
	status: number,
	method: 'GET' | 'PUT' | 'POST' | 'DELETE',
	url: string,
	timestampStart: number,
	timestampEnd: number,
	pattern: string,
}