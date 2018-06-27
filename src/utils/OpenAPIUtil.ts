import {
    AbstractPatternElementOperation,
    RequestMethod,
    PatternElementOutputType,
    OpenAPISpecification, Resource
} from '../interfaces';

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

export function getSelectorsForResource(resourcePath: string, specification: OpenAPISpecification): string[] {
    return Object.keys(specification.paths)
        .filter(path => path.startsWith(resourcePath))
        .filter(path => path.split('/').length - 1 === resourcePath.split('/').length && path.endsWithInputParam())
        .reduce((acc, remainingPath) => remainingPath.getAllInputParams(), []);
}

/**
 * Recursively resolve a path to a collection of {Resource[]}
 *
 * @param resourcePath
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
