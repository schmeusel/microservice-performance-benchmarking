import {
    Pattern,
    OpenAPISpecification,
    Resource,
    AbstractPatternElement,
    PatternElement,
    AbstractPatternConfiguration,
    AbstractPatternElementOperation,
    AbstractPattern,
} from '../interfaces/index';
import * as IntervalDistributionService from '../services/IntervalDistributionService';
import PatternResolverError from '../exceptions/PatternResolverError';
import { AbstractPatternElementExtended } from '../interfaces/patterns/AbstractPatternElement';
import ApplicationState from '../services/ApplicationState';
import { getOutputTypeFromOperation } from "../utils/PatternUtil";
import { doesOperationIdExist, findResourceByName, getOperationIdFromResourceAndOperation } from "../utils/OpenAPIUtil";

class AbstractPatternResolver {
    private _totalRequests: number;
    private _abstractPatterns: AbstractPattern[];
    private _patterns: Pattern[];
    private _openAPISpec: OpenAPISpecification;
    private _resources: Resource[];
    private _patternConfiguration: AbstractPatternConfiguration;

    constructor() {
        this.resolveAbstractPattern = this.resolveAbstractPattern.bind(this);
        this.resolveAbstractPatternSequence = this.resolveAbstractPatternSequence.bind(this);
    }

    public get patterns(): Pattern[] {
        if (!this._patterns) {
            throw new PatternResolverError(`To access patterns, first initialize the resolver.`);
        }
        return this._patterns;
    }

    public initialize(
        abstractPatterns: AbstractPattern[],
        totalRequests: number,
        openAPISpec: OpenAPISpecification,
        resources: Resource[],
        patternConfig: AbstractPatternConfiguration
    ): Promise<void> {
        if (!resources || !resources.length) {
            throw new PatternResolverError('No resources in the OpenAPI sepc.');
        }

        this._totalRequests = totalRequests;
        this._abstractPatterns = abstractPatterns;
        this._openAPISpec = openAPISpec;
        this._resources = resources;
        this._patternConfiguration = patternConfig;

        this.checkUniquessOfPatternNames(abstractPatterns);
        this._patterns = abstractPatterns.map(this.resolveAbstractPattern);
        ApplicationState.setPatterns(this._patterns);
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

        const allNumbers = intervalWaitTimes.every(time => typeof time === 'number');

        if (!allNumbers) {
            throw new PatternResolverError(`For pattern ${abstractPattern.name}, either provide a sound interval or a wait period for each element.`);
        }

        const totalWeight = this._abstractPatterns.reduce((amount, pattern) => amount + pattern.weight, 0);
        const amountOfRequests = Math.round(this._totalRequests / totalWeight * abstractPattern.weight);
        return {
            name: abstractPattern.name,
            sequence: this.resolveAbstractPatternSequence(abstractPattern, intervalWaitTimes),
            amount: amountOfRequests
        };
    }

    private resolveAbstractPatternSequence(pattern: AbstractPattern, intervalWaitTimes: number[]): PatternElement[] {
        const dependencyStructure = this.getDependencyStructure(pattern.sequence);
        const dependenciesWithResources = dependencyStructure.map(dependencyLine => {
            const dependencyDepth = this.getDependencyDepth(dependencyLine);
            const possibleResources: Resource[] = this.getResourcesWithMinimumDepthLevel(this._resources, dependencyDepth);
            return this.mapAbstractPatternToResources(dependencyLine, 0, possibleResources, pattern);
        });

        const flattenedElements: AbstractPatternElementExtended[] = dependenciesWithResources
            .reduce((flattened, dependencyLine) => [...flattened, ...dependencyLine], []);

        // check if same indexes have same resource
        flattenedElements.forEach((extendedElement, i) => {
            const elementsWithSameIndex = flattenedElements.filter(el => el.index === extendedElement.index);
            const allSame = elementsWithSameIndex.reduce((same, el) => same && (el.operationId === extendedElement.operationId || el.resource.name === extendedElement.resource.name), true);
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

        return uniquedElements
            .sort((a, b) => a.index - b.index)
            .map((element, i) => ({
                operationId: element.operationId || getOperationIdFromResourceAndOperation(element.resource, element.operation, this._openAPISpec),
                wait: intervalWaitTimes[i],
                input: element.input,
                output: element.output,
                outputType: getOutputTypeFromOperation(element.operation),
                selector: element.selector,
                resource: element.resource
            }));
    }

    private mapAbstractPatternToResources(
        dependencyLine: AbstractPatternElementExtended[],
        index: number,
        possibleResources: Resource[],
        abstractPattern: AbstractPattern
    ): AbstractPatternElementExtended[] {
        if (index > dependencyLine.length - 1) {
            return dependencyLine;
        }

        const element = dependencyLine[index];

        // user defined operation
        if (element.operationId) {
            const isValid = doesOperationIdExist(element.operationId, this._openAPISpec);
            return this.mapAbstractPatternToResources(dependencyLine, index + 1, possibleResources, abstractPattern);
        }

        // user defined resource
        if (element.id) {
            const resourceName = this._patternConfiguration[abstractPattern.name] ? this._patternConfiguration[abstractPattern.name][element.id] : undefined;
            const resource = findResourceByName(possibleResources, resourceName);

            if (!resource) {
                throw new PatternResolverError(
                    `The specified identifier "${element.id}" could not be located in the customization object for the pattern "${abstractPattern.name}"`
                );
            }

            const intermediate = dependencyLine.map((el, i) => (i === index ? { ...el, resource } : el));
            return this.mapAbstractPatternToResources(intermediate, index + 1, possibleResources, abstractPattern);
        }

        // no previous dependency
        if (!element.input) {
            const resourceIndex: number = Math.round(Math.random() * (possibleResources.length - 1));
            const resource = possibleResources[resourceIndex];

            const intermediate = dependencyLine.map((el, i) => (i === index ? { ...el, resource } : el));
            return this.mapAbstractPatternToResources(intermediate, index + 1, possibleResources, abstractPattern);
        }

        const inputDependencyIndex = dependencyLine.findIndex(patternElement => patternElement.output === element.input);
        if (inputDependencyIndex === -1 || inputDependencyIndex > index) {
            throw new PatternResolverError(`There is no previous AbstractPatternElement whose output is equal to ${element.input}`);
        }

        const inputDependencyResource: Resource = dependencyLine[inputDependencyIndex].resource;
        if (element.operation !== AbstractPatternElementOperation.SCAN) {
            const intermediate = dependencyLine.map((el, i) => (i === index ? {
                ...el,
                resource: inputDependencyResource
            } : el));
            return this.mapAbstractPatternToResources(intermediate, index + 1, possibleResources, abstractPattern);
        }

        if (!inputDependencyResource.subResources || !inputDependencyResource.subResources.length) {
            throw new PatternResolverError(`The element at index ${element.index} requires interaction with a subresource that is not available.`);
        }

        const subResourceIndex = Math.round(Math.random() * (inputDependencyResource.subResources.length - 1));
        const subResouce = inputDependencyResource.subResources[subResourceIndex];
        const intermediate = dependencyLine.map((el, i) => (i === index ? { ...el, resource: subResouce } : el));
        return this.mapAbstractPatternToResources(intermediate, index + 1, possibleResources, abstractPattern);
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

    private getOperationDependencies(sequence: AbstractPatternElement[], index: number, dependencyLine: AbstractPatternElementExtended[]) {
        if (!dependencyLine.length) {
            dependencyLine = [{ ...sequence[index], index: index }];
        }
        const hasInput = !!sequence[index].input;
        for (let i = index - 1; i >= 0; i--) {
            const hasMatchingPreviousOutput = sequence[i].output === sequence[index].input;
            if (hasInput && hasMatchingPreviousOutput) {
                return this.getOperationDependencies(sequence, i, [{ ...sequence[i], index: i }, ...dependencyLine]);
            }
        }
        return dependencyLine;
    }

    private getResourceDepth(resource: Resource): number {
        if (!resource.subResources || !resource.subResources.length) {
            return 1;
        }
        const depth = 1 + Math.max(...resource.subResources.map(r => this.getResourceDepth(r)));
        return depth;
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
