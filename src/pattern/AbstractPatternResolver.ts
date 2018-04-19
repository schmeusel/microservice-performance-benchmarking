import {
    Pattern,
    OpenAPISpecification,
    Resource,
    AbstractPatternElement,
    PatternElement,
    AbstractPatternConfiguration,
    AbstractPatternElementOperation,
    AbstractPattern,
    PatternElementOutputType
} from '../interfaces/index';
import * as IntervalDistributionService from '../services/IntervalDistributionService';
import PatternResolverError from '../exceptions/PatternResolverError';
import { AbstractPatternElementExtended } from '../interfaces/patterns/AbstractPatternElement';

class AbstractPatternResolver {
    private _patterns: Pattern[];
    private _openAPISpec: OpenAPISpecification;
    private _resources: Resource[];
    private _patternConfiguration: AbstractPatternConfiguration;

    public get patterns(): Pattern[] {
        if (!this._patterns) {
            throw new PatternResolverError(`To access patterns, first initialize the resolver.`);
        }
        return this._patterns;
    }
    public initialize(
        abstractPatterns: AbstractPattern[],
        openAPISpec: OpenAPISpecification,
        resources: Resource[],
        patternConfig: AbstractPatternConfiguration
    ): Promise<void> {
        if (!resources || !resources.length) {
            throw new PatternResolverError('No resources in the OpenAPI sepc.');
        }

        this._openAPISpec = openAPISpec;
        this._resources = resources;
        this._patternConfiguration = patternConfig;

        this.checkUniquessOfPatternNames(abstractPatterns);
        this._patterns = abstractPatterns.map(this.resolveAbstractPattern);

        return Promise.resolve();
    }

    private checkUniquessOfPatternNames(abstractPatterns: AbstractPattern[]): void {
        const uniquedPatterns = abstractPatterns.filter((el, i, arr) => {
            return arr.findIndex(element => element.name === el.name) === i;
        });

        if (uniquedPatterns.length !== abstractPatterns.length) {
            throw new PatternResolverError(`Patterns have to have unique names.`);
        }
    }

    private resolveAbstractPattern(abstractPattern: AbstractPattern): Pattern {
        const intervalWaitTimes: number[] = abstractPattern.interval
            ? IntervalDistributionService.generateDistributionData(abstractPattern.sequence.length, abstractPattern.interval)
            : abstractPattern.sequence.map(el => el.wait);

        const allNumbers = intervalWaitTimes.reduce((areNumbers, num) => areNumbers && typeof num === 'number', true);

        if (!allNumbers) {
            throw new PatternResolverError(`For pattern ${abstractPattern.name}, either provide a sound interval or a wait period for each element.`);
        }
        return {
            name: abstractPattern.name,
            sequence: this.resolveAbstractPatternSequence(abstractPattern, intervalWaitTimes),
            weight: abstractPattern.weight
        };
    }

    private resolveAbstractPatternSequence(pattern: AbstractPattern, intervalWaitTimes: number[]): PatternElement[] {
        const dependencyStructure = this.getDependencyStructure(pattern.sequence);
        const dependenciesWithResources = dependencyStructure.map(dependencyLine => {
            const dependencyDepth = this.getDependencyDepth(dependencyLine);
            const possibleResources: Resource[] = this.getResourcesWithMinimumDepthLevel(this._resources, dependencyDepth);
            return this.mapAbstractPatternToResources(dependencyLine, 0, possibleResources);
        });

        const flattenedElements = dependenciesWithResources.reduce((flattened, dependencyLine) => [...flattened, ...dependencyLine], []);

        // check if same indexes have same resource
        flattenedElements.forEach((extendedElement, i) => {
            const elementsWithSameIndex = flattenedElements.filter(el => el.index === extendedElement.index);
            const allSame = elementsWithSameIndex.reduce((same, el) => same && el.resource.name === extendedElement.resource.name, true);
            if (!allSame) {
                throw new PatternResolverError(
                    `Dependency strucutre does not add up. In the '${
                        pattern.name
                    }' pattern, the element at index ${i} could be allocated to multiple resources.`
                );
            }
        });

        const uniquedElements = flattenedElements.filter((el, i, arr) => {
            return arr.findIndex(element => element.index === el.index) === i;
        });

        return uniquedElements.sort((a, b) => a.index - b.index).map((element, i) => {
            const outputType =
                element.operation === AbstractPatternElementOperation.SCAN
                    ? PatternElementOutputType.LIST
                    : element.operation === AbstractPatternElementOperation.DELETE
                        ? PatternElementOutputType.NONE
                        : PatternElementOutputType.ITEM;
            return {
                operationId: this.getOperationIdFromResourceAndOperation(element.resource, element.operation),
                wait: intervalWaitTimes[i],
                input: element.input,
                output: element.output,
                outputType,
                selector: element.selector
            };
        });
    }

    private mapAbstractPatternToResources(
        dependencyLine: AbstractPatternElementExtended[],
        index: number,
        possibleResources: Resource[]
    ): AbstractPatternElementExtended[] {
        if (index > dependencyLine.length - 1) {
            return dependencyLine;
        }

        const element = dependencyLine[index];
        if (!element.input) {
            const resourceIndex: number = Math.round(Math.random() * (possibleResources.length - 1));
            const resource = possibleResources[resourceIndex];
            const intermediate = dependencyLine.map((el, i) => (i === index ? { ...el, resource } : el));
            return this.mapAbstractPatternToResources(intermediate, index + 1, possibleResources);
        }

        const inputDependencyIndex = dependencyLine.findIndex(patternElement => patternElement.output === element.input);
        if (inputDependencyIndex === -1 || inputDependencyIndex > index) {
            throw new PatternResolverError(`There is no previous AbstractPatternElement whose output is equal to ${element.input}`);
        }

        const inputDependencyResource: Resource = dependencyLine[inputDependencyIndex].resource;
        if (element.operation !== AbstractPatternElementOperation.SCAN) {
            const intermediate = dependencyLine.map((el, i) => (i === index ? { ...el, resource: inputDependencyResource } : el));
            return this.mapAbstractPatternToResources(intermediate, index + 1, possibleResources);
        }

        if (!inputDependencyResource.subResources || !inputDependencyResource.subResources.length) {
            throw new PatternResolverError(`The element at index ${element.index} requires interaction with a subresource that is not available.`);
        }

        const subResourceIndex = Math.round(Math.random() * (inputDependencyResource.subResources.length - 1));
        const subResouce = inputDependencyResource.subResources[subResourceIndex];
        const intermediate = dependencyLine.map((el, i) => (i === index ? { ...el, resource: subResouce } : el));
        return this.mapAbstractPatternToResources(intermediate, index + 1, possibleResources);

        // TODO handle case with given ID for resource
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

    private getDependencyStructure(sequence: AbstractPatternElement[]): AbstractPatternElementExtended[][] {
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

    private getDependencyDepth(dependencyLine: AbstractPatternElementExtended[]): number {
        return dependencyLine.reduce((depthLevel, elem) => {
            if (elem.operation === AbstractPatternElementOperation.SCAN) {
                return depthLevel + 1;
            }
            return depthLevel;
        }, 0);
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

export default new AbstractPatternResolver();
