import jsf from 'json-schema-faker';
import { PatternRequest } from '../interfaces/PatternRequest';
import { PatternElement } from '../interfaces/PatternElement';
import { Pattern } from '../interfaces/Pattern';

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

	generate(pattern: Pattern): Promise<PatternRequest[]> {
		return null
	}

}