import { BenchmarkSpecification } from '../interfaces';

class BenchmarkController {
    start(benchmarkSpec: BenchmarkSpecification) {
        throw new Error('start not implemented.');
    }

    initializeServices() {
        // init Swagger and Storage system
        throw new Error('initializeServices not implemented yet.');
    }

    preload() {
        throw new Error('preload not implemented yet.');
    }

    cleanup() {
        // depending on what data has been generated, delete it from storage
        throw new Error('cleanup not implemented yet.');
    }

    processResults() {
        // evaluate results, aggregate data
        throw new Error('processResults not implemented yet.');
    }
}
