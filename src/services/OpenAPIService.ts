import Swagger from 'swagger-client';
import request from 'request';
import { OpenAPIError } from '../exceptions/index';
import OpenAPISpecification, { OperationObject, PathsObject } from '../interfaces/openapi/OpenAPISpecification';
import { OpenAPIClient, AbstractPatternElementOperation, Resource } from '../interfaces/index';

class OpenAPIService {
    private _client: OpenAPIClient;
    private _resources: string[];

    private get client(): OpenAPIClient {
        if (!this._client) {
            throw new OpenAPIError('Service needs to be initialized before trying to use its client.');
        }
        return this._client;
    }

    public get specification(): OpenAPISpecification {
        return this._client.spec;
    }

    public get resources(): string[] {
        if (!this._resources) {
            throw new OpenAPIError(
                'Service needs to be initialized first, so that the resource discovery can be initiated.'
            );
        }
        return this._resources;
    }

    public initiliaze(swaggerFile: object, options: object): Promise<void> {
        return new Promise((resolve, reject) => {
            Swagger({
                spec: swaggerFile,
                http: this.useCustomRequest
            })
                .then(client => {
                    this._client = client;
                    resolve();
                })
                .catch(reject);
        });
    }

    public sendRequest(params, callback) {
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

        return null;
    }

    private discoverResources(path?: string): Resource {
        // TODO handle top level array and subresource discovery in different methods
        const paths = Object.keys(this.specification.paths);
        if (!path) {
            const topLevelResources = paths.reduce((tlr, path) => {
                const regex = /\/?[^/]+$/;
                if (path.match(regex)) {
                    return [...tlr, path];
                }
                return tlr;
            }, []);
            return topLevelResources.map(tlr => {
                return {
                    name: tlr.replace('/', ''),
                    path: tlr,
                    operations: [], // TODO gather operations
                    subResource: this.discoverResources(path)
                } as Resource;
            })[0];
        }
        return null;

        // TODO lay out discovery process
    }

    private mapHttpMethodToElementOperation(path: string, method: string) {
        switch (method.toUpperCase()) {
            case 'GET': {
                // TODO differentiate between read and scan
            }
            case 'PUT':
                return AbstractPatternElementOperation.UPDATE;
            case 'POST':
                return AbstractPatternElementOperation.CREATE;
            case 'DELETE':
                return AbstractPatternElementOperation.DELETE;
        }
    }

    private useCustomRequest(req: object): Promise<any> {
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
                    const { timingStart, timings: { response } } = res;

                    res.timestampStart = timingStart;
                    res.timestampEnd = timingStart + response;
                    res.duration = timingStart + response - timingStart;

                    resolve(response);
                }
            );
        });
    }
}

export default new OpenAPIService();
