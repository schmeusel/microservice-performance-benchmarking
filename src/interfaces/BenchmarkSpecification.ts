import { ConfigurationSpecification, EnvironmentSettings, OpenAPISpecification, SLASpecification } from './index';

export default interface BenchmarkSpecification {
    environment?: EnvironmentSettings;
    configuration: ConfigurationSpecification;
    condition: SLASpecification;
};
