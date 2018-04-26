import { ConfigurationSpecification, EnvironmentSettings, OpenAPISpecification, SLASpecification, AbstractPatternConfiguration } from './index';

export default interface BenchmarkSpecification {
    environment?: EnvironmentSettings;
    configuration: ConfigurationSpecification;
    condition: SLASpecification;
    customization?: AbstractPatternConfiguration;
}
