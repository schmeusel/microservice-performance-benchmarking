import * as simpleStats from "simple-statistics";
import { SLACondition } from "../interfaces";

export function evaluatePatternConditions(conditions: { [sequenceIndex: string]: SLACondition }, patternMeasurements: { [sequenceIndex: string]: number[] }): boolean {
    return Object
        .keys(conditions)
        .every(sequenceIndex => evaluateConditions(conditions[sequenceIndex], patternMeasurements[sequenceIndex]));
}

export function evaluateConditions(condition: SLACondition, measurements: number[]): boolean {
    const objectTypeMapper = {
        min: evaluateMinValue,
        max: evaluateMaxValue,
        mean: evaluateMean,
        stdev: evaluateStandardDeviation,
        percentiles: evaluatePercentiles
    };
    return Object
        .keys(condition)
        .every(type => objectTypeMapper[type](measurements, condition[type]));
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
    return Object
        .keys(percentiles)
        .every(current => evaluatePercentile(series, parseFloat(current), percentiles[current]));
}

export function evaluatePercentile(series: number[], percentile: number, threshold: number): boolean {
    return simpleStats.quantile(series, percentile) <= threshold;
}
