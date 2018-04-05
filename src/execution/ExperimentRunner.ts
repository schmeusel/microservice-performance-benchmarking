import * as cluster from 'cluster';
import PatternRequester from './PatternRequester';
import LoggingService from '../services/LoggingService';
import { Pattern, PatternRequest } from '../interfaces';
import PatternBuilder from '../workload/PatternBuilder';

class ExperimentRunner {
    constructor() {}

    private asyncLoop(index) {}

    private getPattern(name): Pattern {
        return {
            name: name,
            sequence: [],
            weight: 1
        };
    }

    start(amountOfPatterns: number): Promise<void> {
        return new Promise((resolve, reject) => {
            console.log('is master!! in experiment runner');

            let workersAlive = amountOfPatterns;
            for (let i = 0; i < amountOfPatterns; i++) {
                const worker: cluster.Worker = cluster.fork({ pattern: 'test' });
                worker.on('message', message => {
                    if (message.start && message.start === 'yes') {
                        console.log('starting the worker');
                        this.startWorker();
                    }
                });
            }

            cluster
                .on('exit', () => {
                    workersAlive--;
                    if (workersAlive === 0) {
                        resolve();
                    }
                })
                .on('online', () => {
                    console.log('new worker online');
                });
        });
    }

    private startWorker() {
        console.log('is WORKER in experiment runnter');

        const pattern = this.getPattern(process.env.name);
        this.run(pattern, () => {
            console.log('pattern done');
            process.exit();
        });
    }

    private run(pattern: Pattern, callback) {
        console.log('generating PatternRequest[] to run');

        PatternBuilder.generate(pattern).then(patternRequests => {
            const requester: PatternRequester = new PatternRequester(pattern.name, patternRequests);
            requester.run(callback);
        });
    }
}

export default new ExperimentRunner();
