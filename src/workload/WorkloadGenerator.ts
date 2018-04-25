import { Pattern } from '../interfaces';
import PatternBuilder from './PatternBuilder';
import LoggingService from '../services/LoggingService';

class WorkloadGenerator {
    generatePatternWorkload(pattern: Pattern, amount: number, round: number = 0, callback: () => void): void {
        if (round < amount) {
            PatternBuilder.generate(pattern).then(requests => {
                LoggingService.saveGeneratedRequests(requests);
                this.generatePatternWorkload(pattern, amount, round + 1, callback);
            });
        } else {
            callback();
        }
    }
}
