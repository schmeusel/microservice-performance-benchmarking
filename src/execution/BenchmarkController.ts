import { BenchmarkSpecification, OpenAPISpecification, Pattern } from '../interfaces';
import PolyfillUtil from '../utils/PolyfillUtil';
import OpenAPIService from '../services/OpenAPIService';
import LoggingService from '../services/LoggingService';
import ExperimentRunner from './ExperimentRunner';
import AbstractPatternResolver from '../pattern/AbstractPatternResolver';
import WorkloadGenerator from '../workload/WorkloadGenerator';

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
                this.initializeLoggers();
            })
            .then(() => {
                LoggingService.logEvent('Loggers initialized.');
                this.generateWorkloads();
            })
            .then(() => {
                LoggingService.logEvent('Workloads generated.');
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
        const { patterns } = this.specification.configuration;
        const { customization } = this.specification;
        const { specification, resources } = OpenAPIService;
        return AbstractPatternResolver.initialize(patterns, specification, resources, customization);
    }

    private initializeLoggers(): Promise<any> {
        const { patterns } = AbstractPatternResolver;
        LoggingService.initializeWorkloadLoggers(patterns);
        return Promise.resolve();
    }

    private runExperiment(): Promise<void> {
        const patterns = AbstractPatternResolver.patterns;
        return ExperimentRunner.initialize(patterns).start();
    }

    private generateWorkloads(): Promise<void> {
        const { patterns } = AbstractPatternResolver;
        const { totalPatternRequests } = this.specification.configuration;
        return WorkloadGenerator.start(patterns, totalPatternRequests);
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
        const exitCode = wasSuccessful ? 0 : 1;
        LoggingService.logEvent(`Preparing shutdown with exit code: ${exitCode}`);
        process.exitCode = exitCode;
    }
}
