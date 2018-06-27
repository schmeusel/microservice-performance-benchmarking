import * as jsf from 'json-schema-faker';
import { SchemaObject } from "../interfaces/openapi/OpenAPISpecification";

export function generatePopulatedSchema(jsonSchema?: SchemaObject, paramName?: string): Promise<any> {
    if (!jsonSchema) {
        return Promise.resolve(null);
    }
    if (!paramName) {
        return jsf.resolve(jsonSchema);
    } else {
        return jsf.resolve(jsonSchema).then(resolved => ({ [paramName]: resolved }));
    }
}
