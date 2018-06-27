import {
    AbstractPatternElementOperation,
    RequestMethod,
    PatternElementOutputType,
    OpenAPISpecification, Resource
} from '../interfaces';
import { OperationObject, PathsObject } from "../interfaces/openapi/OpenAPISpecification";
import PatternResolverError from "../exceptions/PatternResolverError";

export function mapHttpMethodToElementOperation(path: string, method: string): AbstractPatternElementOperation {
    if (!path || !method || !path.startsWith('/')) {
        return undefined;
    }
    switch (method.toUpperCase()) {
        case RequestMethod.GET: {
            if (path.endsWithInputParam()) {
                return AbstractPatternElementOperation.READ;
            }
            return AbstractPatternElementOperation.SCAN;
        }
        case RequestMethod.PUT:
            return AbstractPatternElementOperation.UPDATE;
        case RequestMethod.POST:
            return AbstractPatternElementOperation.CREATE;
        case RequestMethod.DELETE:
            return AbstractPatternElementOperation.DELETE;
        default:
            return undefined;
    }
}

export function mapOutputTypeAndMethodToOperation(outputType: PatternElementOutputType, method: RequestMethod) {
    switch (method.toUpperCase()) {
        case RequestMethod.POST: {
            return AbstractPatternElementOperation.CREATE;
        }
        case RequestMethod.PUT: {
            return AbstractPatternElementOperation.UPDATE;
        }
        case RequestMethod.DELETE: {
            return AbstractPatternElementOperation.DELETE;
        }
        case RequestMethod.GET: {
            if (outputType === PatternElementOutputType.LIST) {
                return AbstractPatternElementOperation.SCAN;
            }
            if (outputType === PatternElementOutputType.ITEM) {
                return AbstractPatternElementOperation.READ;
            }
        }
        default: {
            throw new Error(`Could not map outputType "${outputType}" and method "${method}" to operation.`);
        }
    }
}

/**
 * Gather all possible operations that a resource supports,
 * directly mapped to an {AbstractPatternElementOperation}
 *
 * @param {string} resourcePath
 * @param {OpenAPISpecification} specification
 * @returns {AbstractPatternElementOperation[]}
 */
export function getOperationsForResource(resourcePath: string, specification: OpenAPISpecification): AbstractPatternElementOperation[] {
    return Object.keys(specification.paths)
        .map(path => {
            const isSame = path === resourcePath;
            const hasResourceAccessor = resourcePath.split('/').length + 1 === path.split('/').length && !!path.getLastInputParam();

            if (isSame || hasResourceAccessor) {
                return Object.keys(specification.paths[path])
                    .filter(methodKey => methodKey.toUpperCase() in RequestMethod)
                    .map(methodKey => {
                        return mapHttpMethodToElementOperation(path, methodKey);
                    })
                    .filter(val => !!val);
            }
            return [];
        })
        .reduce((arr, valOrArr) => (Array.isArray(valOrArr) ? [...arr, ...valOrArr] : [...arr, valOrArr]), [])
        .filter((operation, i, arr) => arr.indexOf(operation) === i);
}

/**
 * Get a list of selectors necessary to access the resource identified by the given resourcePath.
 *
 * @param {string} resourcePath
 * @param {OpenAPISpecification} specification
 * @returns {string[]}
 */
export function getAccessorsForResource(resourcePath: string, specification: OpenAPISpecification): string[] {
    return Object.keys(specification.paths)
        .filter(path => path.startsWith(resourcePath))
        .filter(path => path.split('/').length - 1 === resourcePath.split('/').length && path.endsWithInputParam())
        .reduce((acc, remainingPath) => remainingPath.getAllInputParams(), []);
}

/**
 * Recursively resolve a path to a collection of {Resource[]}
 *
 * @param {string} resourcePath
 * @param {OpenAPISpecification} specification
 * @returns {Resource[]}
 */
export function resolveResourcePath(resourcePath: string, specification: OpenAPISpecification): Resource[] {
    const subResources = Object.keys(specification.paths).filter(path => {
        const startsWithGivenPath = path.startsWith(resourcePath);
        const pathParts = path.split('/');
        const isScanOperation = pathParts.length === resourcePath.split('/').length + 2;
        const hasParamInputAtEndRegex = new RegExp(resourcePath.replace('$', '\\$') + '/\\${.*}$');
        const isAccessorOperation = path.match(hasParamInputAtEndRegex);

        return startsWithGivenPath && (isScanOperation || isAccessorOperation);
    });

    if (!subResources.length) {
        return [];
    }

    return subResources.map(subResourcePath => {
        return {
            name: subResourcePath.split('/').pop(),
            path: subResourcePath,
            operations: getOperationsForResource(subResourcePath, specification),
            subResources: resolveResourcePath(subResourcePath, specification)
        };
    });
}

/**
 * Find the path for a given operationId and OpenAPISpecification
 *
 * @param {string} operationId
 * @param {OpenAPISpecification} specification
 * @returns {string}
 */
export function getPathForOperationId(operationId: string, specification: OpenAPISpecification): string {
    const pathsSpec: PathsObject = specification.paths;
    let path: string = undefined;

    Object.keys(pathsSpec).forEach(pathName => {
        Object.keys(pathsSpec[pathName]).forEach(op => {
            if (pathsSpec[pathName][op].operationId === operationId) {
                path = pathName;
                return;
            }
        });
    });

    if (!path) {
        throw new Error(`No path found for operationId: ${operationId}`);
    }
    return path;
}

/**
 * For a given operationId, find the respective {OperationObject} in which it is used.
 *
 * @param {string} operationId
 * @param {OpenAPISpecification} specification
 * @returns {OperationObject}
 */
export function getOperationObjectByOperationId(operationId: string, specification: OpenAPISpecification): OperationObject {
    const pathsSpec: PathsObject = specification.paths;
    let operationObject: OperationObject = undefined;

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

export function getTopLevelResourcePaths(specification: OpenAPISpecification): string[] {
    return Object.keys(specification.paths).filter(path => {
        return path
                   .split('/')
                   .filter(str => str !== '')
                   .shift()
               === path.replace('/', '');
    });
}

/**
 * Check if a given operationId exists in the OpenAPI spec.
 *
 * @param {string} operationId
 * @returns {boolean}
 */
export function doesOperationIdExist(operationId: string, specification: OpenAPISpecification): boolean {
    return Object
        .keys(specification.paths)
        .reduce((operationIds, path) => ([
            ...operationIds,
            ...Object
                .keys(specification.paths[path])
                .map(operation => specification.paths[path][operation].operationId)
        ]), [])
        .reduce((found, opId) => found || opId === operationId);
}

/**
 * Recursively iterate through resources to find the one matching a given name.
 * @param resources
 * @param resourceName
 */
export function findResourceByName(resources: Resource[], resourceName: string): Resource {
    return resources.reduce((foundResource, resource) => {
        if (foundResource) {
            return foundResource;
        }
        if (resource.name === resourceName) {
            return resource;
        }
        if (!!resource.subResources && !!resource.subResources.length) {
            return findResourceByName(resource.subResources, resourceName);
        }
        return undefined;
    }, undefined);
}

export function getOperationIdFromResourceAndOperation(resource: Resource, op: AbstractPatternElementOperation, specification: OpenAPISpecification): string {
    const lastAccessor = resource.accessors[resource.accessors.length - 1];
    try {
        switch (op) {
            case AbstractPatternElementOperation.CREATE: {
                return specification.paths[resource.path].post.operationId;
            }
            case AbstractPatternElementOperation.SCAN: {
                return specification.paths[resource.path].get.operationId;
            }
            case AbstractPatternElementOperation.READ: {
                return specification.paths[`${resource.path}/{${lastAccessor}}`].get.operationId;
            }
            case AbstractPatternElementOperation.UPDATE: {
                if (specification.paths[`${resource.path}/{${lastAccessor}}`].put) {
                    return specification.paths[`${resource.path}/{${lastAccessor}}`].put.operationId;
                }

                // update without accessor in path, such as PUT /users where all relevant info is in req body
                if (specification.paths[resource.path].put) {
                    return specification.paths[resource.path].put.operationId;
                }
                return specification.paths[resource.path].put.operationId;
            }
            case AbstractPatternElementOperation.DELETE: {
                return specification.paths[`${resource.path}/{${lastAccessor}}`].delete.operationId;
            }
        }
    } catch (e) {
        throw new PatternResolverError(
            `Operation "${op}" not available for resource "${resource.name}". Available operations are: ${resource.operations.join(', ')}`
        );
    }
    throw new PatternResolverError(`"${op}" is not a valid operation.`);
}

export function getServerUrl(servers) {
    if (!servers || !Object.keys(servers)) {
        return null;
    }

    const availableServersUrls = Object
        .keys(servers)
        .filter(url => servers[url]);

    const randomIndex = Math.floor(Math.random() * availableServersUrls.length);
    return availableServersUrls[randomIndex];
}

export function hierarchizeResources(specification: OpenAPISpecification): Resource[] {
    return getTopLevelResourcePaths(specification)
        .map(resourcePath => {
            return {
                name: resourcePath.replace('/', ''),
                path: resourcePath,
                accessors: getAccessorsForResource(resourcePath, specification),
                operations: getOperationsForResource(resourcePath, specification),
                subResources: resolveResourcePath(resourcePath, specification)
            } as Resource;
        });
}
