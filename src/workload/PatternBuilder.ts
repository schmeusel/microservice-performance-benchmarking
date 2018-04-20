import jsf from 'json-schema-faker';
import { PatternElementRequest, PatternElement, Pattern } from '../interfaces/index';
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

            Promise.all([...requestBodySchemata.map(this.generatePopulatedSchema), ...parameters.map(param => this.generatePopulatedSchema(param.schema))])
                .then(paramsArray => {
                    resolve(paramsArray.reduce((allParams, currParams) => ({ ...allParams, ...currParams }), {}));
                })
                .catch(reject);
        });
    }

    private generatePatternRequest(patternElement: PatternElement, index: number): Promise<PatternElementRequest> {
        const opObject: OperationObject = OpenAPIService.getSpecificationByOperationId(patternElement.operationId);
        const request: PatternElementRequest = {
            patternIndex: index,
            operationId: patternElement.operationId,
            params: this.generateClientParamsObject(opObject),
            wait: patternElement.wait
        };
        throw new Error('generatePatternRequest not implemented yet.');
    }

    public generate(pattern: Pattern): Promise<PatternElementRequest[]> {
        const promises: Promise<PatternElementRequest>[] = pattern.sequence.map((patternElement, i) => {
            return this.generatePatternRequest(patternElement, i);
        });
        return Promise.all(promises);
        // return Promise.resolve([
        //     {
        //         patternIndex: 0,
        //         operationId: 'getPetById',
        //         parameters: {
        //             petId: 12
        //         },
        //         wait: 1500
        //     },
        //     {
        //         patternIndex: 1,
        //         operationId: 'getOrderById',
        //         parameters: {
        //             orderId: 12
        //         },
        //         wait: 300
        //     }
        // ]);
    }
}

export default new PatternBuilder();
