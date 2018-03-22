import Swagger from 'swagger-client';
import SwaggerError from '../exceptions/SwaggerError';

class SwaggerService {
	private client: any;

	private attachRequestInterceptor(request, options) {
		return request;
	}

	private attachResponseInterceptor(response, options) {
		return response;
	}

	private attachCustomFetch(url: string, options: object) {

	}

	initiliaze(swaggerFile: object, options: object): Promise<void> {
		// TODO try out custom userFetch
		return new Promise((resolve, reject) => {
			Swagger({
				spec: swaggerFile,
				requestInterceptor: req => this.attachRequestInterceptor(req, options),
				responseInterceptor: res => this.attachResponseInterceptor(res, options),
				// userFetch: (url: string, options: object) => this.attachCustomFetch(url, options),
			})
				.then(client => {
					this.client = client;
				})
				.catch(reject);
		})
	}

	sendRequest(params, callback) {
		if (!this.client) {
			throw new SwaggerError('Service needs to be initialized before sending requests through it.');
		}
		if (!params.operationId || !params.operationId.length) {
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