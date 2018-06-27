import * as simpleStats from "simple-statistics";
import { SLACondition } from "../interfaces";

export function evaluateConditions(condition: SLACondition, measurements: number[]) {
    const objectTypeMapper = {
        min: evaluateMinValue,
        max: evaluateMaxValue,
        mean: evaluateMean,
        stdev: evaluateStandardDeviation,
        percentiles: evaluatePercentiles
    };
    return Object
        .keys(condition)
        .reduce((allValid, type) => objectTypeMapper[type](measurements, condition[type]) && allValid, true);
}

export function evaluateMinValue(series: number[], threshold: number): boolean {
    const min = simpleStats.min(series);
    return min >= threshold;
}

export function evaluateMaxValue(series: number[], threshold: number): boolean {
    const max = simpleStats.max(series);
    return max <= threshold;
}

export function evaluateMean(series: number[], threshold: number): boolean {
    const mean = simpleStats.mean(series);
    return mean <= threshold;
}

export function evaluateStandardDeviation(series: number[], threshold: number): boolean {
    const stdev = simpleStats.standardDeviation(series);
    return stdev <= threshold;
}

export function evaluatePercentiles(series: number[], percentiles: { [percentile: string]: number }): boolean {
    return Object.keys(percentiles).reduce((allValid, current) => {
        return allValid && evaluatePercentile(series, parseInt(current), percentiles[current])
    }, true);
}

export function evaluatePercentile(series: number[], percentile: number, threshold: number): boolean {
    return simpleStats.quantile(series, percentile) <= threshold;
}
