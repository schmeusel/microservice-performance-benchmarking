import { ConfigurationSpecification } from "./ConfigurationSpecification";
import { EnvironmentSettings } from "./EnvironmentSettings";
import { SLASpecification } from "./SLASpecification";

export interface BenchmarkSpecification {
	environment?: EnvironmentSettings,
	openAPISpec: string | object,
	configuration: ConfigurationSpecification,
	condition: SLASpecification
}