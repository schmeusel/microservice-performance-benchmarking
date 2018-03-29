import { AbstractPatternElementOperation, RequestMethod, Resource } from '../interfaces';

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
