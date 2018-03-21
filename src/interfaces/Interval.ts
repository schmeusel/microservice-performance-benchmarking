import { Distribution } from './index';

export default interface Interval {
	distribution: Distribution,
	params: {
		fix?: number,
		stdev?: number,
		mean?: number,
	},
}