import {
    Pattern,
    OpenAPISpecification,
    Resource,
    AbstractPatternElement,
    PatternElement,
    AbstractPatternConfiguration,
    AbstractPatternElementOperation,
    AbstractPattern
} from '../interfaces/index';
import * as IntervalDistributionService from '../services/IntervalDistributionService';
import PatternResolverError from '../exceptions/PatternResolverError';

class AbstractPatternResolver {
    private _abstractPatterns: AbstractPattern[];
    private _openAPISpec: OpenAPISpecification;
    private _resources: Resource[];
    private _patternConfiguration: AbstractPatternConfiguration;

    public initialize(patterns: AbstractPattern[], openAPISpec: OpenAPISpecification, resources: Resource[], patternConfig: AbstractPatternConfiguration) {
        if (!resources || !resources.length) {
            throw new PatternResolverError('No resources in the OpenAPI sepc.');
        }
        this._abstractPatterns = patterns;
        this._openAPISpec = openAPISpec;
        this._resources = resources;
        this._patternConfiguration = patternConfig;
    }

    private resolveAbstractPattern(abstractPattern: AbstractPattern): Pattern {
        const intervalWaitTimes: number[] = abstractPattern.interval
            ? IntervalDistributionService.generateDistributionData(abstractPattern.sequence.length, abstractPattern.interval)
            : null;

        return {
            name: abstractPattern.name,
            sequence: this.resolveAbstractPatternSequence(abstractPattern.sequence as AbstractPatternElement[], intervalWaitTimes, abstractPattern.name),
            weight: abstractPattern.weight
        };
    }

    private resolveAbstractPatternSequence(sequence: AbstractPatternElement[], intervalTimes: number[], patternName: string): PatternElement[] {
        return sequence.map((elem, i) => {
            if (intervalTimes) {
                return this.resolveAbstractPatternElement(sequence, i, intervalTimes[i], patternName);
            }
            return this.resolveAbstractPatternElement(sequence, i, elem.wait || 0, patternName);
        });
    }

    private resolveAbstractPatternElement(sequence: AbstractPatternElement[], index: number, waitTime: number, patternName: string): PatternElement {
        return {
            operationId: this.resolveAbstractPatternOperation(sequence, index, patternName),
            input: sequence[index].input,
            output: sequence[index].output,
            selector: sequence[index].selector,
            wait: waitTime
        };
    }

    /**
     * structure for example: [
     *      [{ index: 2, ...element }, { index: 3, ...element }],
     * ]
     */

    private resolveAbstractPatternOperations(pattern: AbstractPattern): string[] {
        const dependencyStructure = this.getDependencyStructure(pattern.sequence);
        const dependenciesWithResources = dependencyStructure.map(depenLine => {});
    }

    private resolveAbstractPatternOperation(sequence: AbstractPatternElement[], index: number, patternName: string): string {
        const isDependentOnPrevious = !!sequence[index].input;
        const hasSpecifiedResource = !!sequence[index].id;
        if (!isDependentOnPrevious) {
            let resource;

            if (hasSpecifiedResource) {
                const specifiedResourceName = this._patternConfiguration[patternName] && this._patternConfiguration[patternName][sequence[index].id];
                if (!specifiedResourceName) {
                    throw new PatternResolverError(
                        `The element ID ${sequence[index].id} for the "${patternName}" pattern is not specified in the pattern configuration.`
                    );
                }
                resource = this.findResource(this._resources, specifiedResourceName);
            } else {
                // pick random resource
                const resourceIndex = Math.round(Math.random() * this._resources.length) - 1;
                resource = this._resources[resourceIndex];
            }
            if (!resource) {
                throw new PatternResolverError(
                    `The specified resource "${this._patternConfiguration[patternName][sequence[index].id]}" cannot be found in the OpenAPI specification.`
                );
            }

            return this.getOperationIdFromResourceAndOperation(resource, sequence[index].operation);
        }

        // has input depedency
        const input = sequence[index].input;

        return '';
    }

    /**
     * Recursively iterate through resources to find the one matching a given name.
     * @param resources
     * @param resourceName
     */
    private findResource(resources: Resource[], resourceName: string): Resource {
        return resources.reduce((foundResource, resource) => {
            if (foundResource) {
                return foundResource;
            }
            if (resource.name === resourceName) {
                return resource;
            }
            if (!!resource.subResources) {
                return this.findResource(resource.subResources, resourceName);
            }
            return foundResource;
        }, undefined);
    }

    private getOperationIdFromResourceAndOperation(resource: Resource, op: AbstractPatternElementOperation): string {
        try {
            switch (op) {
                case AbstractPatternElementOperation.CREATE: {
                    return this._openAPISpec.paths[resource.path].post.operationId;
                }
                case AbstractPatternElementOperation.SCAN: {
                    return this._openAPISpec.paths[resource.path].get.operationId;
                }
                case AbstractPatternElementOperation.READ: {
                    return this._openAPISpec.paths[`${resource.path}/\${${resource.selector}}`].get.operationId;
                }
                case AbstractPatternElementOperation.UPDATE: {
                    return this._openAPISpec.paths[`${resource.path}/\${${resource.selector}}`].put.operationId;
                }
                case AbstractPatternElementOperation.DELETE: {
                    return this._openAPISpec.paths[`${resource.path}/\${${resource.selector}}`].delete.operationId;
                }
            }
        } catch (e) {
            throw new PatternResolverError(
                `Operation "${op}" not available for resource "${resource.name}". Available operations are: ${resource.operations.join(', ')}`
            );
        }
        throw new PatternResolverError(`"${op}" is not a valid operation.`);
    }

    private getDependencyStructure(sequence: AbstractPatternElement[]): object[] {
        return sequence
            .map((elem, i) => {
                return this.getOperationDependencies(sequence, i, []);
            })
            .reduceRight((result, depen, i) => {
                const alreadyHasIndex = result.find(obj => obj[0].index === depen[0].index);
                if (alreadyHasIndex) {
                    return result;
                }
                return [depen, ...result];
            }, []);
    }

    private getOperationDependencies(sequence: AbstractPatternElement[], index: number, dependencyLine: object[]) {
        if (!dependencyLine) {
            dependencyLine = [{ index: index, operation: sequence[index].operation }];
        }
        for (let i = index - 1; i > 0; i--) {
            const hasInput = !!sequence[index].input;
            const hasMatchingPreviousOutput = sequence[i].output === sequence[index].input;
            if (hasInput && hasMatchingPreviousOutput) {
                return this.getOperationDependencies(sequence, i, [{ index: i, operation: sequence[i].operation }, ...dependencyLine]);
            }
        }
        return dependencyLine;
    }

    private getResourceDepth(resource: Resource): number {
        if (!resource.subResources) {
            return 1;
        }
        return 1 + Math.max(...resource.subResources.map(r => this.getResourceDepth(r)));
    }

    private getResourcesWithMinimumDepthLevel(resources: Resource[], level: number) {
        return resources
            .map(resource => ({ ...resource, level: this.getResourceDepth(resource) }))
            .filter(resource => resource.level >= level)
            .map(({ level, ...rest }) => ({
                ...rest,
                subResources: rest.subResources ? this.getResourcesWithMinimumDepthLevel(rest.subResources, level - 1) : undefined
            }));
    }
}
