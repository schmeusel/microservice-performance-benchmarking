import * as Parallel from 'paralleljs';
import PatternRequester from './PatternRequester';
import LoggingService from '../services/LoggingService';
import { Pattern, PatternRequest } from '../interfaces';
import PatternBuilder from '../workload/PatternBuilder';

class ExperimentRunner {
    private asyncLoop(index) {}

    start(patterns: Pattern[]) {
        const processes = new Parallel(patterns);
        processes
            .require(this.run)
            .map(this.run)
            .then(result => {
                console.log('result from processes', result);
            });
    }

    private run(pattern: Pattern): Promise<void> {
        return new Promise((resolve, reject) => {
            console.log('generating PatternRequest[] to run');
            PatternBuilder.generate(pattern).then(patternRequests => {
                const requester: PatternRequester = new PatternRequester(pattern.name, patternRequests);
                requester.run(resolve);
            });
        });
    }
}

export default new ExperimentRunner();
