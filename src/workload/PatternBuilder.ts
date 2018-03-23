import jsf from 'json-schema-faker';
import { PatternRequest, PatternElement, Pattern } from '../interfaces/index';
import { generateDistributionData } from '../services/IntervalDistributionService';
import { SchemaObject, OperationObject } from '../interfaces/openapi/OpenAPISpecification';

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
                this.generatePopulatedSchema(requestBody),
                ...parameters.map(param => this.generatePopulatedSchema(param.schema))
            ])
                .then(paramsArray => {
                    resolve(paramsArray.reduce((allParams, currParams) => ({ ...allParams, ...currParams }), {}));
                })
                .catch(reject);
        });
    }

    private generatePatternRequest(): Promise<PatternRequest> {
        throw new Error('generatePatternRequest not implemented yet.');
    }

    static generate(pattern: Pattern): Promise<PatternRequest[]> {
        throw new Error('generate not implemented yet.');
    }
}
