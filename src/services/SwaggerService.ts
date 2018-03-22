import Swagger from 'swagger-client';
import request from 'request';
import { SwaggerError } from '../exceptions/index';

class SwaggerService {
	private client: any;

	private attachRequestInterceptor(request, options) {
		return request;
	}

	private attachResponseInterceptor(response, options) {
		console.log('attaching response interceptor', response);

		return response;
	}

	private attachCustomFetch(req: object): Promise<any> {
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

	initiliaze(swaggerFile: object, options: object): Promise<void> {
		return new Promise((resolve, reject) => {
			Swagger({
				spec: swaggerFile,
				http: (req: object) => this.attachCustomFetch(req),
			})
				.then(client => {
					this.client = client;
				})
				.catch(reject);
		})
	}

	sendRequest(params, callback) {
		if (!this.client) {
			throw new SwaggerError('Service needs to be initialized before sending requests through it.');
		}
		if (!params.operationId || !params.operationId.length) {
			throw new SwaggerError('operationId is required for params.')
		}
		this.client.execute({ ...params })
			.then(response => {
				callback(null, response)
			})
			.catch(callback);

	}

	getSpecification() {
		if (!this.client) {
			throw new SwaggerError('Service needs to be initialized before sending requests through it.');
		}
		return this.client.spec;
	}

	getSpecificationByOperationId(operationId: string) {
		// TODO implement get specification by operation ID
		throw new Error('getSpecificationByOperationId not implemented yet.')
	}
}

export default new SwaggerService();