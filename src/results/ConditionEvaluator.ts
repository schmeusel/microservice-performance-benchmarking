import { PatternResult, Validator } from '../interfaces/index';

class ConditionEvaluator implements Validator {
    private patternResults: PatternResult[];

    constructor(patternResults: PatternResult[]) {
        this.patternResults = patternResults;
    }

    public validate(): boolean {
        throw new Error('validate not implemented yet.');
    }

    private validatePatternResult(patternResult: PatternResult) {
        throw new Error('validatePatternResult not implemented yet.');
    }

    private validateCondition(): boolean {
        throw new Error('validateCondition not implemented yet.');
    }

    private fail(): void {
        process.exit(1);
    }
}
