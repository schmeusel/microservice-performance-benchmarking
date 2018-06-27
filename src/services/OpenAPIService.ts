import * as Swagger from 'swagger-client';
import * as request from 'request';
import OpenAPIError from '../exceptions/OpenAPIError';
import OpenAPISpecification, { OperationObject, PathsObject } from '../interfaces/openapi/OpenAPISpecification';
import { OpenAPIClient, AbstractPatternElementOperation, Resource, EnvironmentSettings } from '../interfaces/index';
import { RequestMethod } from '../interfaces/RequestMethod';
import {
    getSelectorsForResource,
    getOperationsForResource,
    mapHttpMethodToElementOperation
} from '../utils/OpenAPIUtil';
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
                    this._resources = this.hierarchizeResources();
                    ApplicationState.setOpenAPISpecification(this._client.spec);
                    resolve();
                })
                .catch(reject);
        });
    }

    public sendRequest(params): Promise<any> {
        if (!params.operationId || !params.operationId.length) {
            throw new OpenAPIError('operationId is required for params.');
        }
        const server = this.selectServerUrl();
        return this.client.execute({ ...params, server });
    }

    public getSpecificationByOperationId(operationId: string): OperationObject {
        const pathsSpec: PathsObject = this.specification.paths;
        let operationObject: OperationObject = undefined;

        // TODO more functional
        Object.keys(pathsSpec).forEach(pathName => {
            Object.keys(pathsSpec[pathName]).forEach(op => {
                if (pathsSpec[pathName][op].operationId === operationId) {
                    operationObject = pathsSpec[pathName][op];
                    return;
                }
            });
        });

        return operationObject;
    }

    public getPathForOperationId(operationId: string): string {
        const pathsSpec: PathsObject = this.specification.paths;
        let path: string = undefined;

        Object.keys(pathsSpec).forEach(pathName => {
            Object.keys(pathsSpec[pathName]).forEach(op => {
                if (pathsSpec[pathName][op].operationId === operationId) {
                    path = pathName;
                    return;
                }
            });
        });

        return path;
    }

    public getSelectorsForOperationId(operationId: string) {
        const path = this.getPathForOperationId(operationId);
        return path.getAllInputParams();
    }

    private hierarchizeResources(): Resource[] {
        const topLevelResourcePaths = Object.keys(this.specification.paths).filter(
            path =>
                path
                    .split('/')
                    .filter(str => str !== '')
                    .shift() === path.replace('/', '')
        );
        return topLevelResourcePaths.map(resourcePath => {
            return {
                name: resourcePath.replace('/', ''),
                path: resourcePath,
                selector: getSelectorsForResource(resourcePath, this.specification),
                operations: getOperationsForResource(resourcePath, this.specification),
                subResources: this.resolveResourcePath(resourcePath)
            } as Resource;
        });
    }

    /**
     * Recursively resolve a path to a collection of {Resource[]}
     *
     * @param resourcePath
     */
    private resolveResourcePath(resourcePath: string): Resource[] {
        const subResources = Object.keys(this.specification.paths).filter(path => {
            const startsWithGivenPath = path.startsWith(resourcePath);
            const pathParts = path.split('/');
            const isScanOperation = pathParts.length === resourcePath.split('/').length + 2;
            // const isAccessorOperation = pathParts.length - 1 === resourcePath.split('/').length && !!path.getLastInputParam
            const hasParamInputAtEndRegex = new RegExp(resourcePath.replace('$', '\\$') + '/\\${.*}$');
            const isAccessorOperation = path.match(hasParamInputAtEndRegex);

            return startsWithGivenPath && (isScanOperation || isAccessorOperation);
        });

        if (!subResources.length) {
            return []; // (or return null)
        }

        return subResources.map(subResourcePath => {
            return {
                name: subResourcePath.split('/').pop(),
                path: subResourcePath,
                operations: getOperationsForResource(subResourcePath, this.specification),
                subResources: this.resolveResourcePath(subResourcePath)
            };
        });
    }

    /**
     * Use the request.js HTTP module to take advantage of its built-in timestamping
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

                    const {
                        timingStart,
                        timings: { response }
                    } = res;
                    res.timestampStart = timingStart;
                    res.timestampEnd = timingStart + response;
                    res.duration = timingStart + response - timingStart;

                    resolve(res);
                }
            );
        });
    }

    private selectServerUrl(): string {
        if (!Object.keys(this._servers)) {
            return null;
        }

        const availableServersUrls = Object.keys(this._servers).filter(url => this._servers[url]);
        const randomIndex = Math.floor(Math.random() * availableServersUrls.length)
        return availableServersUrls[randomIndex];
    }
}

export default new OpenAPIService();
