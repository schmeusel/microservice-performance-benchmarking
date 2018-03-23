import { AbstractPattern, OpenAPISpecification, Resource } from '../interfaces/index';

class AbstractPatternResolver {
    private _abstractPatterns: AbstractPattern[];
    private _openAPISpec: OpenAPISpecification;
    private _resources: Resource[];

    initialize(abstractPatterns: AbstractPattern[], openAPISpec: OpenAPISpecification, resources: Resource[]) {
        this._abstractPatterns = abstractPatterns;
        this._openAPISpec = openAPISpec;
        this._resources = resources;
    }
}
