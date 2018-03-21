import { ConfigurationSpecification, EnvironmentSettings, SLASpecification } from "./index";

export default interface BenchmarkSpecification {
	environment?: EnvironmentSettings,
	openAPISpec: string | object,
	configuration: ConfigurationSpecification,
	condition: SLASpecification
}