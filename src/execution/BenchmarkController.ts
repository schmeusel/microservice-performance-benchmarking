import { BenchmarkSpecification, OpenAPISpecification } from '../interfaces';
import PolyfillUtil from '../utils/PolyfillUtil';
import OpenAPIService from '../services/OpenAPIService';
import LoggingService from '../services/LoggingService';

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
            .then(() => this.preLoad())
            .then(() => this.runExperiment())
            .then(() => this.processResults())
            .then((wasSuccessful: boolean) => {
                this.cleanUp();
                this.prepareShutdown(wasSuccessful);
            });
    }

    private initializeServices(): Promise<any> {
        return Promise.all([
            PolyfillUtil.initialize(),
            OpenAPIService.initialize(this.openAPIInput, {}),
            LoggingService.initialize()
        ]);
    }

    private runExperiment(): Promise<void> {
        // implement runExperiment
        return Promise.resolve();
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
