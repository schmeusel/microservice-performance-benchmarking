import { AbstractPatternElementOperation, RequestMethod, Resource, PatternElementOutputType } from '../interfaces';

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
        case RequestMethod.GET: {
            if (outputType === PatternElementOutputType.LIST) {
                return AbstractPatternElementOperation.SCAN;
            }
            if (outputType === PatternElementOutputType.ITEM) {
                return AbstractPatternElementOperation.READ;
            }
        }
        case RequestMethod.POST: {
            return AbstractPatternElementOperation.CREATE;
        }
        case RequestMethod.PUT: {
            return AbstractPatternElementOperation.UPDATE;
        }
        case RequestMethod.DELETE: {
            return AbstractPatternElementOperation.DELETE;
        }
        default: {
            throw new Error(`Could not map outputType "${outputType}" and method "${method}" to operation.`);
        }
    }
}
