import { Pattern, PatternElementOutputType, PatternElementRequest, RequestMethod } from "../interfaces";
import { findIdKey } from "./Helpers";

export function enrichRequestWithInputItem(request: PatternElementRequest, inputItem, possibleSelectors: string[]): PatternElementRequest {
    const paramKeys = Object.keys(request.parameters);
    const requestBodyKeys = Object.keys(request.requestBody);
    const inputItemKeys = Object.keys(inputItem);

    const idKey = inputItemKeys.find(findIdKey(possibleSelectors));

    if (!idKey) {
        throw new Error('Could not locate identifying key from input. Input keys are: ' + JSON.stringify(inputItemKeys));
    }

    // Look for suitable key in parameters
    const paramKeyToBeReplaced = paramKeys.find(findIdKey(possibleSelectors));
    if (paramKeyToBeReplaced) {
        return {
            ...request,
            parameters: {
                ...request.parameters,
                [paramKeyToBeReplaced]: inputItem[idKey]
            }
        }
    }

    // Look for suitable key in requestBody
    const requestBodyKeyToBeReplaced = requestBodyKeys.find(findIdKey(possibleSelectors));
    return {
        ...request,
        requestBody: {
            ...request.requestBody,
            [requestBodyKeyToBeReplaced || idKey]: inputItem[idKey]
        }
    }

    // throw new Error('Could not locate identifying key from parameters or request body. Parameter keys are: ' + JSON.stringify(paramKeys) + ". Request body keys: " + JSON.stringify(requestBodyKeys));
}

export function getOutputType(outputName: string, pattern: Pattern): PatternElementOutputType {
    const sequenceElement = pattern.sequence.find(el => el.output === outputName);
    if (!sequenceElement) {
        throw new Error(`No sequence element found for name: ${outputName}`);
    }
    return sequenceElement.outputType;
}

export function getProcessableResponse(response) {
    return typeof response === "string" ? JSON.parse(response) : response;
}

export function getRequestMethodFromResponse(response): RequestMethod {
    return response.request.method.toUpperCase() as RequestMethod;
}

export function getStatusCode(response) {
    return response.statusCode;
}

export function getRequestUrlFromResponse(response) {
    return response.request.uri.href;
}

export function getBodyFromResponse(response) {
    const processableResponse = getProcessableResponse(response);
    return typeof processableResponse.body === 'string'
        ? JSON.parse(response.body)
        : response.body;
}
