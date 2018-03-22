import Swagger from 'swagger-client';
import request from 'request';
import { OpenAPIError } from '../exceptions/index';

class OpenAPIService {
	private _client: any;
	private _resources: string[];

	public get specification() {
		if (!this._client) {
			throw new OpenAPIError('Service needs to be initialized before sending requests through it.');
		}
		return this._client.spec;
	}

	public get resources(): string[] {
		if (!this._resources) {
			throw new OpenAPIError('Service needs to be initialized first, so that the resource discovery can be initiated.');
		}
		return this._resources;
	}

	public initiliaze(swaggerFile: object, options: object): Promise<void> {
		return new Promise((resolve, reject) => {
			Swagger({
				spec: swaggerFile,
				http: this.useCustomRequest,
			})
				.then(client => {
					this._client = client;
					resolve();
				})
				.catch(reject);
		})
	}

	public sendRequest(params, callback) {
		if (!this._client) {
			throw new OpenAPIError('Service needs to be initialized before sending requests through it.');
		}
		if (!params.operationId || !params.operationId.length) {
			throw new OpenAPIError('operationId is required for params.')
		}
		this._client.execute({ ...params })
			.then(response => {
				callback(null, response)
			})
			.catch(callback);
	}

	getSpecificationByOperationId(operationId: string) {
		// TODO implement get specification by operation ID
		throw new Error('getSpecificationByOperationId not implemented yet.')
	}

	private discoverResources(): void {
		if (!this._client || !this._client.spec) {
			throw new OpenAPIError('Service needs to be initialized before starting the resource discovery phase.');
		}
		// TODO lay out discovery process

	}

	private useCustomRequest(req: object): Promise<any> {
		return new Promise((resolve, reject) => {
			request({
				...req,
				time: true
			}, (error, res) => {
				if (error) {
					reject(error);
					return;
				}
				const {timingStart, timings: { response } } = res;

                res.timestampStart = timingStart;
                res.timestampEnd = timingStart + response;
				res.duration = (timingStart + response) - timingStart;

				resolve(response);
			})
		});
	}
}

export default new OpenAPIService();
