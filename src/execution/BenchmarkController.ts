import { BenchmarkSpecification, OpenAPISpecification, Pattern } from '../interfaces';
import PolyfillUtil from '../utils/PolyfillUtil';
import OpenAPIService from '../services/OpenAPIService';
import LoggingService from '../services/LoggingService';
import ExperimentRunner from './ExperimentRunner';

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
            .then(() => {
                LoggingService.log('All services initialized.');
                this.preLoad();
            })
            .then(() => {
                LoggingService.log('Pre loading finished.');
                return this.runExperiment();
            })
            .then(() => {
                LoggingService.log('Experiment finished.');
                return this.processResults();
            })
            .then((wasSuccessful: boolean) => {
                LoggingService.log('Results processed.');
                this.prepareShutdown(wasSuccessful);
                return this.cleanUp();
            })
            .then(() => {
                LoggingService.log('Clean up done.');
            })
            .catch(err => {
                console.error(err);
                LoggingService.log('Initialization error');
                this.prepareShutdown(false);
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
        const patterns = [
            {
                name: 'test',
                sequence: [],
                weight: 1
            } as Pattern
        ];
        return new ExperimentRunner(patterns).start();
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
