import {
    BenchmarkSpecification,
    ConfigurationSpecification,
    EnvironmentSettings,
    SLASpecification,
    SLACondition,
    PatternElement,
    Pattern
} from '../interfaces/index';

import ValidationError from '../exceptions/ValidationError';

class BenchmarkSpecificationValidator {
    public validate(benchmarkSpecification: BenchmarkSpecification): boolean {
        return (
            this.validateConfiguration(benchmarkSpecification.configuration) &&
            this.validateEnvironment(benchmarkSpecification.environment) &&
            this.validateSLASpecification(benchmarkSpecification.condition)
        );
    }

    private validateConfiguration(configuration: ConfigurationSpecification): boolean {
        throw new ValidationError('validateConfiguration not implemented yet.');
    }

    private validateEnvironment(environment: EnvironmentSettings): boolean {
        throw new ValidationError('validateEnvironment not implemented yet.');
    }

    private validateSLASpecification(condition: SLASpecification): boolean {
        if (!condition.latency) {
            throw new ValidationError('"configuration.latency" is a required property');
        }
        Object.keys(condition).forEach(key => {
            this.validateSLACondition(condition[key]);
        });

        return true;
    }

    private validateSLACondition(condition: SLACondition): boolean {
        const allowedKeys: string[] = ['min', 'max', 'mean', 'stdev'];
        Object.keys(condition).forEach(key => {
            if (!allowedKeys.includes(key)) {
                throw new ValidationError(
                    `Only "${allowedKeys.join(', ')}" are allowed to specify an SLA condition, not "${key}"`
                );
            }
        });
        if (!Object.keys(condition).length) {
            throw new ValidationError(
                `There has to be at least one property as a pass/fail condition. Possible properties are "${allowedKeys.join(
                    ','
                )}"`
            );
        }

        return true;
    }

    private validateConfigurationPattern(pattern: Pattern) {
        if (!pattern.sequence.length) {
            throw new ValidationError('There should at least be one pattern defined.');
        }

        // TODO implement function
        pattern.sequence.forEach((el: PatternElement) => {});

        return true;
    }
}

export default new BenchmarkSpecificationValidator();
