import jsf from 'json-schema-faker';
import { PatternRequest, PatternElement } from '../interfaces/index';
import { Pattern } from '../interfaces/Pattern';
import { generateDistributionData } from '../services/IntervalDistributionService';

class PatternBuilder {
	private generatePopulatedSchema(jsonSchema): Promise<any> {
		if (!jsonSchema) {
			return Promise.resolve(null);
		}
		return jsf.resolve(jsonSchema);
	}

	private generateParamsObject(specification): Promise<any> {
		return new Promise((resolve, reject) => {
			const { requestBody, parameters } = specification;

			Promise.all([
				this.generatePopulatedSchema(requestBody),
				...parameters.map(this.generatePopulatedSchema)
			])
				.then(paramsArray => {
					resolve(
						paramsArray.reduce((allParams, currParams) => ({ ...allParams, ...currParams }), {})
					)
				})
				.catch(reject);
		})
	}

	private generatePatternRequest(): Promise<PatternRequest> {
		return null
	}

	static generate(pattern: Pattern): Promise<PatternRequest[]> {
		return null
	}

}