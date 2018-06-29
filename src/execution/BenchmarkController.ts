import { ApplicationPhase, BenchmarkSpecification, OpenAPISpecification, Pattern } from '../interfaces';
import PolyfillUtil from '../utils/PolyfillUtil';
import OpenAPIService from '../services/OpenAPIService';
import LoggingService from '../services/LoggingService';
import ExperimentRunner from './ExperimentRunner';
import AbstractPatternResolver from '../pattern/AbstractPatternResolver';
import WorkloadGenerator from '../workload/WorkloadGenerator';
import Server from '../webServer/Server';
import { EventEmitter } from 'events';
import ApplicationState from '../services/ApplicationState';
import EvaluationService from "../services/EvaluationService";
import { getExitCodeFromSuccess } from "../utils/Helpers";

export default class BenchmarkController extends EventEmitter {
    private readonly specification: BenchmarkSpecification;
    private readonly openAPIInput: string | OpenAPISpecification;

    constructor(spec: BenchmarkSpecification, openAPISpec: string | OpenAPISpecification) {
        super();
        this.specification = spec;
        this.openAPIInput = openAPISpec;
        ApplicationState.setAbstractPatterns(spec.configuration.patterns);
    }

    public start() {
        this.initializeServices()
            .then(() => {
                ApplicationState.setPhase(ApplicationPhase.PATTERN_RESOLUTION);
                if (this.specification.configuration.manualDecision) {
                    this.startWebServer();
                }
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
                ApplicationState.setPhase(ApplicationPhase.WORKLOAD_GENERATION);
                LoggingService.logEvent('Loggers initialized.');
                return this.generateWorkloads();
            })
            .then(() => {
                ApplicationState.setPhase(ApplicationPhase.REQUEST_TRANSMISSION);
                LoggingService.logEvent('Workloads generated.');
                return this.runExperiment();
            })
            .then(() => {
                LoggingService.logEvent('Experiment finished.');
                if (!this.specification.configuration.manualDecision) {
                    ApplicationState.setPhase(ApplicationPhase.MEASUREMENT_EVALUATION);
                    LoggingService.logEvent('Starting to process results.')
                    return this.processResults();
                } else {
                    return Promise.resolve(true);
                }
            })
            .then((wasSuccessful: boolean) => {
                ApplicationState.setPhase(ApplicationPhase.COMPLETION);
                LoggingService.logEvent('Results processed.');
                this.prepareShutdown(wasSuccessful);
                return this.cleanUp();
            })
            .then(() => {
                LoggingService.logEvent('Clean up done.');
            })
            .catch(err => {
                LoggingService.logEvent('Benchmark failed!');
                LoggingService.logEvent('---' + err.toString() + ' [STACK] ' + err.stack);
                this.prepareShutdown(false);
            });
    }

    private initializeServices(): Promise<any> {
        return Promise.all([
            PolyfillUtil.initialize(),
            OpenAPIService.initialize(this.openAPIInput, this.specification.environment),
            LoggingService.initialize(),
            EvaluationService.initialize(),
        ]);
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
        // implement possible preLoad phase
        return Promise.resolve();
    }

    private cleanUp(): Promise<void> {
        // implement possible cleanUp phase
        return Promise.resolve();
    }

    private processResults(): Promise<boolean> {
        return EvaluationService.evaluateMeasurements(this.specification.condition);
    }

    private startWebServer(): void {
        LoggingService.logEvent('Starting the server');
        Server.start()
            .then(port => {
                LoggingService.logEvent(`Server started on port ${port}`);
            })
            .catch(err => {
                LoggingService.logEvent('Error starting server');
                LoggingService.logEvent('---' + err.toString());
            });
    }

    /**
     * By just setting the exit code allow graceful shutdown.
     */
    private prepareShutdown(wasSuccessful: boolean): void {
        const exitCode = getExitCodeFromSuccess(wasSuccessful);
        LoggingService.logEvent(`Preparing shutdown with exit code: ${exitCode}`);
        process.exitCode = exitCode;
    }
}
