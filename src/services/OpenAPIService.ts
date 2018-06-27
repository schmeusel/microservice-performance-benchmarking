import * as Swagger from 'swagger-client';
import * as request from 'request';
import OpenAPIError from '../exceptions/OpenAPIError';
import OpenAPISpecification, { OperationObject } from '../interfaces/openapi/OpenAPISpecification';
import { OpenAPIClient, Resource, EnvironmentSettings, PatternElementRequest } from '../interfaces/index';
import { getPathForOperationId, getOperationObjectByOperationId, getServerUrl, hierarchizeResources } from '../utils/OpenAPIUtil';
import ApplicationState from './ApplicationState';

class OpenAPIService {
    private _client: OpenAPIClient;
    private _resources: Resource[];
    private _servers: { [serverName: string]: boolean };

    private get client(): OpenAPIClient {
        if (!this._client) {
            throw new OpenAPIError('Service needs to be initialized before trying to use its client.');
        }
        return this._client;
    }

    public get specification(): OpenAPISpecification {
        return this.client.spec;
    }

    public get resources(): Resource[] {
        if (!this._resources) {
            throw new OpenAPIError('Service needs to be initialized first, so that the resource discovery can be initiated.');
        }
        return this._resources;
    }

    public initialize(openAPISpec: OpenAPISpecification | string, environmentOptions: EnvironmentSettings = {}): Promise<void> {
        return new Promise((resolve, reject) => {
            this._servers = environmentOptions.servers;
            Swagger({
                spec: typeof openAPISpec !== 'string' ? openAPISpec : null,
                url: typeof openAPISpec === 'string' ? openAPISpec : null,
                http: this.useCustomRequest,
                securities: {
                    authorized: environmentOptions.authorizations,
                }
            })
                .then(client => {
                    this._client = client;
                    this._resources = hierarchizeResources(this.specification);
                    ApplicationState.setOpenAPISpecification(this._client.spec);
                    resolve();
                })
                .catch(reject);
        });
    }

    public sendRequest(params: PatternElementRequest): Promise<any> {
        return this.client.execute({
            ...params,
            server: getServerUrl(this._servers),
        });
    }

    public getSpecificationByOperationId(operationId: string): OperationObject {
        return getOperationObjectByOperationId(operationId, this.specification);
    }

    public getSelectorsForOperationId(operationId: string) {
        const path = getPathForOperationId(operationId, this.specification);
        return path.getAllInputParams();
    }

    /**
     * Use the request.js HTTP module to take advantage of its built-in timestamp functionality
     * for when a request was sent and received.
     *
     * For 'time: true', see https://github.com/request/request#requestoptions-callback
     * @param req
     */
    private useCustomRequest(req: any): Promise<any> {
        return new Promise((resolve, reject) => {
            request(
                {
                    ...req,
                    time: true
                },
                (error, res) => {
                    if (error) {
                        reject(error);
                        return;
                    }

                    // set timestampStart, timestampEnd, and duration on response object
                    const { timingStart, timings: { response } } = res;
                    res.timestampStart = timingStart;
                    res.timestampEnd = timingStart + response;
                    res.duration = timingStart + response - timingStart;

                    resolve(res);
                }
            );
        });
    }
}

export default new OpenAPIService();
