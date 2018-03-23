import { ConfigurationSpecification, EnvironmentSettings, OpenAPISpecification, SLASpecification } from './index';

export default interface BenchmarkSpecification {
    environment?: EnvironmentSettings;
    openAPISpec: string | OpenAPISpecification;
    configuration: ConfigurationSpecification;
    condition: SLASpecification;
};
