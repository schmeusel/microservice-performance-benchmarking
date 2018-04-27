import { Pattern } from '../interfaces';
import PatternBuilder from './PatternBuilder';
import LoggingService from '../services/LoggingService';

class WorkloadGenerator {
    public start(patterns: Pattern[], totalAmount: number): Promise<any> {
        return Promise.all(
            patterns.map(pattern => {
                return new Promise((resolve, reject) => {
                    this.generatePatternWorkload(pattern, 0, resolve, reject);
                });
            })
        );
    }

    private generatePatternWorkload(pattern: Pattern, round: number = 0, resolve: () => void, reject: () => void): void {
        if (round < pattern.amount) {
            PatternBuilder.generate(pattern, round).then(requests => {
                LoggingService.saveGeneratedRequests(requests);
                this.generatePatternWorkload(pattern, round + 1, resolve, reject);
            });
            // TODO add potential catch block
        } else {
            resolve();
        }
    }
}

export default new WorkloadGenerator();
