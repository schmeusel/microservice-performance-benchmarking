import * as Swagger from 'swagger-client';
import * as request from 'request';
import OpenAPIError from '../exceptions/OpenAPIError';
import OpenAPISpecification, { OperationObject, PathsObject } from '../interfaces/openapi/OpenAPISpecification';
import { OpenAPIClient, AbstractPatternElementOperation, Resource } from '../interfaces/index';
import { RequestMethod } from '../interfaces/RequestMethod';
import { mapHttpMethodToElementOperation } from '../utils/OpenAPIUtil';

class OpenAPIService {
    private _client: OpenAPIClient;
    private _resources: Resource[];

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
            throw new OpenAPIError(
                'Service needs to be initialized first, so that the resource discovery can be initiated.'
            );
        }
        return this._resources;
    }

    public initialize(openAPISpec: OpenAPISpecification | string, options: object): Promise<void> {
        return new Promise((resolve, reject) => {
            // console.log('starting to intialize swagger with spec', openAPISpec);

            Swagger({
                spec: openAPISpec,
                // spec: typeof openAPISpec !== 'string' ? openAPISpec : null,
                // url: typeof openAPISpec === 'string' ? openAPISpec : null,
                http: this.useCustomRequest
            })
                .then(client => {
                    this._client = client;
                    this._resources = this.hierarchizeResources();
                    resolve();
                })
                .catch(reject);
        });
    }

    public sendRequest(params, callback) {
        console.log('sending request in openAPIService with params', params);

        if (!params.operationId || !params.operationId.length) {
            throw new OpenAPIError('operationId is required for params.');
        }
        this.client
            .execute({ ...params })
            .then(response => {
                callback(null, response);
            })
            .catch(callback);
    }

    public getSpecificationByOperationId(operationId: string): OperationObject {
        const pathsSpec: PathsObject = this.specification.paths;
        Object.keys(pathsSpec).forEach(pathName => {
            Object.keys(pathsSpec[pathName]).forEach(op => {
                if (pathsSpec[pathName][op].operationId === operationId) {
                    return pathsSpec[pathName][op];
                }
            });
        });

        return undefined;
    }

    private hierarchizeResources(): Resource[] {
        // const topLevelResourcePaths = Object.keys(this.specification.paths).filter(path => path.match(/\/?[^/]+$/));
        const topLevelResourcePaths = Object.keys(this.specification.paths).filter(
            path => path.split('/').shift() === path.replace('/', '')
        );
        return topLevelResourcePaths.map(resourcePath => {
            return {
                name: resourcePath.replace('/', ''),
                path: resourcePath,
                operations: this.getOperationsForResource(resourcePath),
                subResources: this.resolveResourcePath(resourcePath)
            } as Resource;
        });
    }

    /**
     * Gather all possible operations that a resource supports,
     * directly mapped to an {AbstractPatternElementOperation}
     *
     * @param resourcePath {string}
     * @returns {AbstracPatternElementOperation[]}
     */
    private getOperationsForResource(resourcePath: string): AbstractPatternElementOperation[] {
        return Object.keys(this.specification.paths)
            .map(path => {
                const isSame = path === resourcePath;
                const hasResourceAccessor =
                    resourcePath.split('/').length === path.split('/').length + 1 &&
                    path
                        .split('/')
                        .pop()
                        .endsWithInputParam();
                if (isSame || hasResourceAccessor) {
                    return Object.keys(this.specification.paths[path])
                        .filter(methodKey => methodKey.toUpperCase() in RequestMethod)
                        .map(methodKey => {
                            return mapHttpMethodToElementOperation(path, methodKey);
                        })
                        .filter(val => !!val);
                }
                return [];
            })
            .reduce((arr, valOrArr) => (Array.isArray(valOrArr) ? [...arr, ...valOrArr] : [...arr, valOrArr]), []);
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
            const hasParamInputAtEndRegex = new RegExp(resourcePath.replace('$', '\\$') + '/\\${.*}$');
            const isReadOperation = path.match(hasParamInputAtEndRegex);

            return startsWithGivenPath && (isScanOperation || isReadOperation);
        });

        if (!subResources.length) {
            return []; // (or return null)
        }

        return subResources.map(subResourcePath => {
            return {
                name: subResourcePath.split('/').pop(),
                path: subResourcePath,
                operations: this.getOperationsForResource(subResourcePath),
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
                    console.log('response in request with status', res.statusCode);

                    const { timingStart, timings: { response } } = res;

                    // const answer = {
                    //     ...res,
                    //     timestampStart: timingStart,
                    //     timestampEnd: timingStart + response,
                    //     duration: timingStart + response - timingStart
                    // };
                    res.timestampStart = timingStart;
                    res.timestampEnd = timingStart + response;
                    res.duration = timingStart + response - timingStart;

                    resolve(res);

                    // resolve(answer);
                }
            );
        });
    }
}

export default new OpenAPIService();
