import { PatternElementRequest, PatternElement, Pattern } from '../interfaces/index';
import { OperationObject } from '../interfaces/openapi/OpenAPISpecification';
import OpenAPIService from '../services/OpenAPIService';
import { generatePopulatedSchema } from "../utils/GeneratorUtil";

class PatternBuilder {
    private generateClientParamsObject(operation: OperationObject): Promise<any> {
        return new Promise((resolve, reject) => {
            const { parameters } = operation;

            Promise.all(parameters.map(param => generatePopulatedSchema(param.schema, param.name)))
                .then((paramsArray) => {
                    if (paramsArray && paramsArray.length) {
                        const result = paramsArray.reduce((allParams, currParams) => ({ ...allParams, ...currParams }), {});
                        resolve(result)
                        return
                    }
                    resolve({});
                })
                .catch(reject);
        });
    }

    private generateClientRequestBodyObject(operation: OperationObject): Promise<any> {
        return new Promise((resolve, reject) => {
            const { requestBody } = operation;
            if (!requestBody) {
                resolve({});
            }
            const requestBodySchemata = Object.keys(requestBody.content).reduce((schemata, mediaType) => {
                return [...schemata, requestBody.content[mediaType].schema];
            }, []);

            Promise.all(requestBodySchemata.map(schema => generatePopulatedSchema(schema, null)))
                .then((requestBodyArray) => {
                    if (requestBodyArray && requestBodyArray.length) {
                        const result = requestBodyArray.reduce((allParams, currParams) => ({ ...allParams, ...currParams }), {});
                        resolve(result);
                        return
                    }
                    resolve({});
                })
                .catch(reject);
        })
    }

    private generatePatternRequest(patternName, patternElement: PatternElement, index: number, round: number): Promise<PatternElementRequest> {
        const opObject: OperationObject = OpenAPIService.getSpecificationByOperationId(patternElement.operationId);
        return new Promise((resolve: (req: PatternElementRequest) => void, reject) => {
            Promise.all([this.generateClientParamsObject(opObject), this.generateClientRequestBodyObject(opObject)])
                .then(([parameters, requestBody]) => {
                    const request: PatternElementRequest = {
                        patternName: patternName,
                        patternIndex: index,
                        operationId: patternElement.operationId,
                        parameters: parameters,
                        requestBody: requestBody,
                        wait: patternElement.wait,
                        round: round
                    };
                    resolve(request);
                });
        });
    }

    public generate(pattern: Pattern, round: number): Promise<PatternElementRequest[]> {
        const promises: Promise<PatternElementRequest>[] = pattern.sequence.map((patternElement, i) => {
            return this.generatePatternRequest(pattern.name, patternElement, i, round);
        });
        return Promise.all(promises);
    }
}

export default new PatternBuilder();
