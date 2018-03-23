import Prob from 'prob.js';
import { Interval, Distribution } from '../interfaces/index';

export function generateDistributionData(amount, options: Interval) {
    const { distribution, params } = options;
    if (distribution === Distribution.UNIFORM) {
        return Array.from({ length: amount }, () => params.fix);
    }

    if (distribution === Distribution.NORMAL) {
        const { mean, stdev } = params;
        const seed = Prob.normal(mean, stdev);
        return Array.from({ length: amount }, () => seed());
    }

    throw new Error(`The "${distribution}" distribution has not been implemented yet.`);
}
