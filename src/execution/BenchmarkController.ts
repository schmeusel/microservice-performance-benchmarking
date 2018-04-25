import { BenchmarkSpecification, OpenAPISpecification, Pattern } from '../interfaces';
import PolyfillUtil from '../utils/PolyfillUtil';
import OpenAPIService from '../services/OpenAPIService';
import LoggingService from '../services/LoggingService';
import ExperimentRunner from './ExperimentRunner';
import AbstractPatternResolver from '../pattern/AbstractPatternResolver';

export default class BenchmarkController {
    private specification: BenchmarkSpecification;
    private openAPIInput: string | OpenAPISpecification;
    private wasSuccessful: boolean;

    constructor(spec: BenchmarkSpecification, openAPISpec: string | OpenAPISpecification) {
        this.specification = spec;
        this.openAPIInput = openAPISpec;
    }

    public start() {
        this.initializeServices()
            .then(() => this.initializePatternResolver())
            .then(() => {
                LoggingService.logEvent('All services initialized.');
                this.preLoad();
            })
            .then(() => {
                LoggingService.logEvent('Pre loading finished.');
                return this.runExperiment();
            })
            .then(() => {
                LoggingService.logEvent('Experiment finished.');
                return this.processResults();
            })
            .then((wasSuccessful: boolean) => {
                LoggingService.logEvent('Results processed.');
                this.prepareShutdown(wasSuccessful);
                return this.cleanUp();
            })
            .then(() => {
                LoggingService.logEvent('Clean up done.');
            })
            .catch(err => {
                console.error(err);
                LoggingService.logEvent('Initialization error');
                this.prepareShutdown(false);
            });
    }

    private initializeServices(): Promise<any> {
        return Promise.all([PolyfillUtil.initialize(), OpenAPIService.initialize(this.openAPIInput, {}), LoggingService.initialize()]);
    }

    private initializePatternResolver(): Promise<any> {
        return AbstractPatternResolver.initialize(this.specification.configuration.patterns, OpenAPIService.specification, OpenAPIService.resources, {});
    }

    private runExperiment(): Promise<void> {
        const patterns = AbstractPatternResolver.patterns;
        return ExperimentRunner.initialize(patterns).start();
    }

    private preLoad(): Promise<void> {
        // TODO implement possible preLoad phase
        return Promise.resolve();
    }

    private cleanUp(): Promise<void> {
        // TODO implement possible cleanUp phase
        return Promise.resolve();
    }

    private processResults(): Promise<boolean> {
        // TODO implement process Results
        return Promise.resolve(true);
    }

    /**
     * By just setting the exit code allow graceful shutdown.
     */
    private prepareShutdown(wasSuccessful: boolean): void {
        process.exitCode = wasSuccessful ? 0 : 1;
    }
}
