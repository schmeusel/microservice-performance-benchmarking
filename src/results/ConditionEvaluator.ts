import { PatternRequestResult, Validator } from "../interfaces/index";

class ConditionEvaluator implements Validator {
	private patternResults: PatternRequestResult[];

	constructor(patternResults: PatternRequestResult[]) {
		this.patternResults = patternResults;
	}

	public validate(): boolean {
		throw new Error('validate not implemented yet.')
	}

	private validatePatternResult(patternResult: PatternRequestResult) {
		throw new Error('validatePatternResult not implemented yet.');
	}

	private validateCondition(): boolean {
		throw new Error('validateCondition not implemented yet.');
	}

	private fail(): void {
		process.exit(1);
	}
}
