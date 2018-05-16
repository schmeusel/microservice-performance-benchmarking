import * as fs from 'fs';
import * as readline from 'readline';
import * as simpleStats from 'simple-statistics';
import config from '../config';
import { SLASpecification, SLACondition } from '../interfaces/index';
import EvaluationError from '../exceptions/EvaluationError';
import { LoggingService } from "./LoggingService";

class EvaluationService {

    private timestampStartIndex: number;
    private timestampEndIndex: number;
    private patternNameIndex: number;

    private measurements: { [patternName: string]: number[] } = {};

    public initialize(): Promise<any> {
        const csvKeys = LoggingService.getMeasurementCSVFields();

        this.timestampStartIndex = csvKeys.findIndex(key => key === 'timestampStart');
        this.timestampEndIndex = csvKeys.findIndex(key => key === 'timestampEnd');
        this.patternNameIndex = csvKeys.findIndex(key => key === 'pattern');

        if (this.timestampStartIndex < 0 || this.timestampEndIndex < 0 || this.patternNameIndex < 0) {
            throw new EvaluationError('Could not find timestampStart, timestampEnd, and pattern in CSV config in LoggingService.');
        }

        return Promise.resolve();
    }

    evaluateMeasurements(slaSpec: SLASpecification): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.readMeasurements()
                .then(() => {
                    if (!Object.keys(this.measurements).length) {
                        throw new EvaluationError('No measurements found.');
                    }
                    const result = Object
                        .keys(slaSpec)
                        .map(patternName => this.evaluateConditions(slaSpec[patternName], patternName))
                        .reduce((conditionsMet, result) => conditionsMet && result, true);
                    resolve(result);
                })
                .catch(reject);
        });
    }

    private evaluateConditions(condition: SLACondition, patternName: string) {
        return Object.keys(condition).reduce((allValid, type) => {
            let intermediateResult: boolean;
            switch (type) {
                case 'min': {
                    intermediateResult = this.evaluateMinValue(this.measurements[patternName], condition[type]);
                    break;
                }
                case 'max': {
                    intermediateResult = this.evaluateMaxValue(this.measurements[patternName], condition[type]);
                    break;
                }
                case 'mean': {
                    intermediateResult = this.evaluateMean(this.measurements[patternName], condition[type]);
                    break;
                }
                case 'stdev': {
                    intermediateResult = this.evaluateStandardDeviation(this.measurements[patternName], condition[type]);
                    break;
                }
                case 'percentiles': {
                    intermediateResult = this.evaluatePercentiles(this.measurements[patternName], condition[type]);
                    break;
                }
                default: {
                    intermediateResult = true;
                }
            }
            return intermediateResult && allValid;
        }, true);
    }

    private readMeasurements(): Promise<void> {
        const self = this;
        return new Promise((resolve, reject) => {
            readline
                .createInterface({
                    input: fs.createReadStream(config.logging.loggers.measurements.filename, 'utf8')
                })
                .on('line', (line: string) => {
                    const values = line.split(',');
                    const latency = parseInt(values[this.timestampEndIndex]) - parseInt(values[this.timestampStartIndex]);
                    const patternName = values[this.patternNameIndex];
                    if (patternName === 'pattern') {
                        return;
                    }
                    if (!this.measurements[patternName]) {
                        this.measurements[patternName] = [];
                    }
                    this.measurements[patternName].push(latency);

                })
                .on('close', () => {
                    resolve();
                })
                .on('error', err => {
                    reject(err);
                });
        });
    }

    private evaluateMinValue(series: number[], threshold: number): boolean {
        const min = simpleStats.min(series);
        return min >= threshold;
    }

    private evaluateMaxValue(series: number[], threshold: number): boolean {
        const max = simpleStats.max(series);
        return max <= threshold;
    }

    private evaluateMean(series: number[], threshold: number): boolean {
        const mean = simpleStats.mean(series);
        return mean <= threshold;
    }

    private evaluateStandardDeviation(series: number[], threshold: number): boolean {
        const stdev = simpleStats.standardDeviation(series);
        return stdev <= threshold;
    }

    private evaluatePercentiles(series: number[], percentiles: { [percentile: string]: number }): boolean {
        return Object.keys(percentiles).reduce((allValid, current) => {
            return allValid && this.evaluatePercentile(series, parseInt(current), percentiles[current])
        }, true);
    }

    private evaluatePercentile(series: number[], percentile: number, threshold: number): boolean {
        return simpleStats.quantile(series, percentile) <= threshold;
    }
}

export default new EvaluationService();
