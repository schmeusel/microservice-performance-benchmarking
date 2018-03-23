import { OpenAPISpecification } from '../index';

export default interface OpenAPIClient {
    spec: OpenAPISpecification;
    execute: (params: object) => any;
};
