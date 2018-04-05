import jsf from 'json-schema-faker';
import { PatternRequest, PatternElement, Pattern } from '../interfaces/index';
import { generateDistributionData } from '../services/IntervalDistributionService';
import { SchemaObject, OperationObject } from '../interfaces/openapi/OpenAPISpecification';
import OpenAPIService from '../services/OpenAPIService';

class PatternBuilder {
    private generatePopulatedSchema(jsonSchema?: SchemaObject): Promise<any> {
        if (!jsonSchema) {
            return Promise.resolve(null);
        }
        return jsf.resolve(jsonSchema);
    }

    private generateClientParamsObject(operation: OperationObject): Promise<any> {
        return new Promise((resolve, reject) => {
            const { parameters, requestBody } = operation;
            const requestBodySchemata = Object.keys(requestBody.content).reduce((schemata, mediaType) => {
                return [...schemata, requestBody.content[mediaType].schema];
            }, []);

            Promise.all([
                ...requestBodySchemata.map(this.generatePopulatedSchema),
                ...parameters.map(param => this.generatePopulatedSchema(param.schema))
            ])
                .then(paramsArray => {
                    resolve(paramsArray.reduce((allParams, currParams) => ({ ...allParams, ...currParams }), {}));
                })
                .catch(reject);
        });
    }

    private generatePatternRequest(patternElement: PatternElement): Promise<PatternRequest> {
        const opObject: OperationObject = OpenAPIService.getSpecificationByOperationId(patternElement.operationId);
        throw new Error('generatePatternRequest not implemented yet.');
    }

    public generate(pattern: Pattern): Promise<PatternRequest[]> {
        return Promise.resolve([
            {
                patternIndex: 0,
                operationId: 'getPetById',
                parameters: {
                    petId: 12
                },
                wait: 1500
            }
        ]);
        // TODO initiaize genereation
    }
}

export default new PatternBuilder();
