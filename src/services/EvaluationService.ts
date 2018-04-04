import * as fs from 'fs';
import * as readline from 'readline';
import * as simpleStats from 'simple-statistics';
import config from '../config';
import SLAConditionMeasure, { SLASpecification, SLACondition } from '../interfaces/index';
import { EvaluationError } from '../exceptions';

class EvaluationService {
    evaluateMeasurements(slaSpec: SLASpecification): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.readMeasurements().then(measurements => {
                if (!measurements.length) {
                    throw new EvaluationError('No measurements found.');
                }
                Promise.all(Object.keys(slaSpec).map(type => this.evaluateCondition(type, slaSpec[type], measurements)))
                    .then(conditionsResults => {
                        resolve(conditionsResults.reduce((conditionsMet, result) => conditionsMet && result, true));
                    })
                    .catch(reject);
            });
        });
    }

    evaluateCondition(type: string, condition: SLACondition, measurements: string[]): boolean {
        switch (type) {
            case 'latency': {
                return this.evaluateLatency(condition, measurements);
            }
            default: {
                throw new EvaluationError(`${type} is not supported as an SLA condition.`);
            }
        }
    }

    evaluateLatency(condition: SLACondition, measurements: string[]): boolean {
        const durationSeries: number[] = measurements.map(measurement => 234); // TODO extract duration;
        return Object.keys(condition).reduce((allConditionsMet, typeOfCondition) => {
            switch (typeOfCondition) {
                case 'min':
                    return allConditionsMet && this.evaluateMinValue(durationSeries, condition.min);
                case 'max':
                    return allConditionsMet && this.evaluateMaxValue(durationSeries, condition.max);
                case 'mean':
                    return allConditionsMet && this.evaluateMean(durationSeries, condition.mean);
                case 'stdev':
                    return allConditionsMet && this.evaluateStandardDeviation(durationSeries, condition.stdev);
                default: {
                    throw new EvaluationError(`${typeOfCondition} is not a valid option for an SLACondition.`);
                }
            }
        }, true);
    }

    private readMeasurements(): Promise<string[]> {
        return new Promise((resolve, reject) => {
            const measurements: string[] = [];
            readline
                .createInterface({
                    input: fs.createReadStream(config.logging.systemEvents.filepath, 'utf8'),
                    output: process.stdout,
                    terminal: false
                })
                .on('line', line => {
                    measurements.push(line);
                })
                .on('close', () => {
                    resolve(measurements);
                })
                .on('error', err => {
                    reject(err);
                });
        });
    }

    private evaluateMinValue(series: number[], threshold: SLAConditionMeasure): boolean {
        const min = simpleStats.min(series); // TODO adapt to sla condition measure
        return min >= threshold;
    }

    private evaluateMaxValue(series: number[], threshold: SLAConditionMeasure): boolean {
        const max = simpleStats.max(series); // TODO adapt to sla condition measure
        return max <= threshold;
    }

    private evaluateMean(series: number[], threshold: SLAConditionMeasure): boolean {
        const mean = simpleStats.mean(series);
        return mean <= threshold; // TODO see SLACondition interface for 'mean'
    }

    private evaluateStandardDeviation(series, threshold: SLAConditionMeasure): boolean {
        const stdev = simpleStats.standardDeviation(series); // TODO adapt to sla condition measure
        return stdev <= threshold;
    }
}

export default new EvaluationService();
