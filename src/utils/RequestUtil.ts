import { Pattern, PatternElement, PatternElementOutputType, PatternElementRequest, PatternElementSelector, RequestMethod } from "../interfaces";
import { findIdKey, getRandomNumber } from "./Helpers";

export function enrichRequestWithInputItem(request: PatternElementRequest, inputItem, possibleAccessors: string[]): PatternElementRequest {
    return enrichParametersObject(request, inputItem, possibleAccessors) ||
           enrichBodyRequestObject(request, inputItem, possibleAccessors) ||
           request;
}

function enrichParametersObject(request: PatternElementRequest, inputItem, possibleAccessors: string[]): PatternElementRequest {
    const paramKeys = Object.keys(request.parameters);
    const inputItemKeys = Object.keys(inputItem);

    const idKey = inputItemKeys.find(findIdKey(possibleAccessors));
    if (!idKey) {
        return undefined;
    }

    const paramKeyToBeReplaced = paramKeys.find(findIdKey(possibleAccessors));
    if (paramKeyToBeReplaced) {
        return {
            ...request,
            parameters: {
                ...request.parameters,
                [paramKeyToBeReplaced]: inputItem[idKey]
            }
        }
    }
    return undefined;
}

function enrichBodyRequestObject(request: PatternElementRequest, inputItem, possibleAccessors: string[]): PatternElementRequest {
    const requestBodyKeys = Object.keys(request.requestBody);
    const inputItemKeys = Object.keys(inputItem);

    const idKey = inputItemKeys.find(findIdKey(possibleAccessors));
    if (!idKey) {
        return undefined;
    }

    const requestBodyKeyToBeReplaced = requestBodyKeys.find(findIdKey(possibleAccessors));
    if (requestBodyKeyToBeReplaced) {
        return {
            ...request,
            requestBody: {
                ...request.requestBody,
                [requestBodyKeyToBeReplaced || idKey]: inputItem[idKey]
            }
        }
    }
    return undefined;
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

export function getInputItemFromList(sequenceElement: PatternElement, outputList: any[]): any {
    if (!Array.isArray(outputList)) {
        throw new Error(`Output data for a list item is not an array or no element in array.`);
    }
    if (!outputList.length) {
        return {};
    }
    switch (sequenceElement.selector) {
        case PatternElementSelector.FIRST:
            return outputList.shift();
        case PatternElementSelector.LAST:
            return outputList.pop();
        case PatternElementSelector.RANDOM:
        default: {
            const randomIndex = getRandomNumber(outputList.length - 1);
            return outputList[randomIndex];
        }
    }
}

export function buildNewOutputs(outputName: string, outputType: PatternElementOutputType, previousOutputs: any, response: any) {
    if (!outputName) {
        return previousOutputs;
    }

    return {
        ...previousOutputs,
        [outputName]: {
            ...(previousOutputs[outputName] || {}),
            [outputType]: getBodyFromResponse(response)
        }
    }
}
