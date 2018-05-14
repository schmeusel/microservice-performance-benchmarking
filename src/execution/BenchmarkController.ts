import { BenchmarkSpecification, OpenAPISpecification, Pattern } from '../interfaces';
import PolyfillUtil from '../utils/PolyfillUtil';
import OpenAPIService from '../services/OpenAPIService';
import LoggingService from '../services/LoggingService';
import ExperimentRunner from './ExperimentRunner';
import AbstractPatternResolver from '../pattern/AbstractPatternResolver';
import WorkloadGenerator from '../workload/WorkloadGenerator';
import Server from '../webServer/Server';
import { EventEmitter } from 'events';
import ApplicationState from '../services/ApplicationState';

export default class BenchmarkController extends EventEmitter {
    private specification: BenchmarkSpecification;
    private openAPIInput: string | OpenAPISpecification;
    private wasSuccessful: boolean;

    constructor(spec: BenchmarkSpecification, openAPISpec: string | OpenAPISpecification) {
        super();
        this.specification = spec;
        this.openAPIInput = openAPISpec;
        ApplicationState.setAbstractPatterns(spec.configuration.patterns);
    }

    public start() {
        this.initializeServices()
            .then(() => {
                ApplicationState.setPhase('PATTERN_RESOLUTION');
                // TODO only start when in config specified
                // Server.start()
                //     .then(port => {
                //         LoggingService.logEvent(`Server started on port ${port}`);
                //     })
                //     .catch(err => {
                //         LoggingService.logEvent('Error starting server');
                //     });
                return this.initializePatternResolver();
            })
            .then(() => {
                LoggingService.logEvent('All services initialized.');
                return this.preLoad();
            })
            .then(() => {
                LoggingService.logEvent('Pre loading finished.');
                return this.initializeWorkloadLoggers();
            })
            .then(() => {
                ApplicationState.setPhase('WORKLOAD_GENERATION');
                LoggingService.logEvent('Loggers initialized.');
                return this.generateWorkloads();
            })
            .then(() => {
                ApplicationState.setPhase('REQUEST_TRANSMISSION');
                LoggingService.logEvent('Workloads generated.');
                return this.runExperiment();
            })
            .then(() => {
                ApplicationState.setPhase('MEASUREMENT_EVALUATION');
                LoggingService.logEvent('Experiment finished.');
                return this.processResults();
            })
            .then((wasSuccessful: boolean) => {
                ApplicationState.setPhase('COMPLETION');
                LoggingService.logEvent('Results processed.');
                this.prepareShutdown(wasSuccessful);
                return this.cleanUp();
            })
            .then(() => {
                LoggingService.logEvent('Clean up done.');
            })
            .catch(err => {
                LoggingService.logEvent('Initialization error');
                this.prepareShutdown(false);
            });
    }

    private initializeServices(): Promise<any> {
        return Promise.all([PolyfillUtil.initialize(), OpenAPIService.initialize(this.openAPIInput, {}), LoggingService.initialize()]);
    }

    private initializePatternResolver(): Promise<any> {
        const { patterns, totalPatternRequests } = this.specification.configuration;
        const { customization, configuration } = this.specification;
        const { specification, resources } = OpenAPIService;
        return AbstractPatternResolver.initialize(patterns, totalPatternRequests, specification, resources, customization);
    }

    private initializeWorkloadLoggers(): Promise<any> {
        const { patterns } = AbstractPatternResolver;
        LoggingService.initializeWorkloadLoggers(patterns);
        return Promise.resolve();
    }

    private runExperiment(): Promise<void> {
        const patterns = AbstractPatternResolver.patterns;
        return ExperimentRunner.initialize(patterns).then(runner => runner.start());
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
