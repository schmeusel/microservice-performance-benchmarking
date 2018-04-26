import { Pattern } from '../interfaces';
import PatternBuilder from './PatternBuilder';
import LoggingService from '../services/LoggingService';

class WorkloadGenerator {
    public start(patterns: Pattern[], totalAmount: number): Promise<any> {
        const totalWeight = patterns.reduce((amountSoFar, pattern) => pattern.weight + amountSoFar, 0);
        return Promise.all(
            patterns.map(pattern => {
                return new Promise((resolve, reject) => {
                    const totalPatternRequests = Math.round(totalAmount / totalWeight * pattern.weight);
                    this.generatePatternWorkload(pattern, totalPatternRequests, 0, resolve, reject);
                });
            })
        );
    }

    private generatePatternWorkload(pattern: Pattern, totalAmountForPattern: number, round: number = 0, resolve: () => void, reject: () => void): void {
        if (round < totalAmountForPattern) {
            PatternBuilder.generate(pattern, round).then(requests => {
                LoggingService.saveGeneratedRequests(requests);
                this.generatePatternWorkload(pattern, totalAmountForPattern, round + 1, resolve, reject);
            });
            // TODO add potential catch block
        } else {
            resolve();
        }
    }
}

export default new WorkloadGenerator();
