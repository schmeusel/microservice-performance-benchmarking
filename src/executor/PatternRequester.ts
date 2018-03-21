import request from 'request';
import { PatternRequest, PatternRequestMeasurement } from '../interfaces/index';

class PatternRequester {
	private pattern: string;
	private requests: PatternRequest[];
	private requestCount: number;
	private measurements: PatternRequestMeasurement[]

	constructor(pattern: string, requests: PatternRequest[]) {
		this.pattern = pattern;
		this.requests = requests;
		this.measurements = [];
	}

	private asyncLoop(index: number, callback: () => void): void {
		if (index < this.requests.length) {
			const currentRequest: PatternRequest = this.requests[index];
			this.sendRequest(currentRequest, () => {
				setTimeout(() => {
					this.asyncLoop(index + 1, callback);
				}, currentRequest.wait);
			})
		} else {
			callback();
		}
	}

	private sendRequest(requestToSend: PatternRequest, callback: () => void): Promise<void> {
		// TODO use SwaggerService for http requests
		return new Promise((resolve, reject) => {
			request({
				url: requestToSend.url,
				method: requestToSend.method,
				time: true
			}, (error, res) => {
				if (error) {
					callback()
				}
				const { timingStart, timings: { response } } = res;
				const measurement: PatternRequestMeasurement = {
					pattern: this.pattern,
					status: res.status,
					method: requestToSend.method,
					url: requestToSend.url,
					timestampStart: timingStart,
					timestampEnd: timingStart + response
				}
				this.measurements.push(measurement);
				callback();
			})
		})
	}

	public run(callback: () => any): void {
		this.asyncLoop(0, callback);
	}

	public getMeasurements(): PatternRequestMeasurement[] {
		return this.measurements
	}
}