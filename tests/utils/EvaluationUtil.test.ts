import { expect } from 'chai';
import {
    evaluateConditions,
    evaluateMaxValue,
    evaluateMean,
    evaluateMinValue, evaluatePercentile, evaluatePercentiles,
    evaluateStandardDeviation
} from "../../src/utils/EvaluationUtil";

describe('Test EvaluationUtil', () => {
    describe('evaluateMinValue(...)', () => {
        it('should return true if minimum value is above given threshold', () => {
            const result = evaluateMinValue([1, 2, 3], 0);
            expect(result).to.be.true;
        });

        it('should return false if minimum value is below given threshold', () => {
            const result = evaluateMinValue([1, 2, 3], 2);
            expect(result).to.be.false;
        });
    });

    describe('evaluateMaxValue(...)', () => {
        it('should return true if maximum value is below given threshold', () => {
            const result = evaluateMaxValue([1, 2, 3], 4);
            expect(result).to.be.true;
        });

        it('should return false if maximum value is above given threshold', () => {
            const result = evaluateMinValue([1, 2, 3], 2);
            expect(result).to.be.false;
        });
    });

    describe('evaluateMean(...)', () => {
        it('should return true if mean value is below given threshold', () => {
            const result = evaluateMean([1, 2, 3], 3);
            expect(result).to.be.true;
        });

        it('should return false if mean value is above given threshold', () => {
            const result = evaluateMean([1, 2, 3], 1);
            expect(result).to.be.false;
        });
    });

    describe('evaluateStandardDeviation(...)', () => {
        it('should return true if standard deviation is below or equal given threshold', () => {
            const equalResult = evaluateStandardDeviation([1, 2, 3], 1);
            expect(equalResult).to.be.true;

            const belowResult = evaluateStandardDeviation([1, 2, 3], 2);
            expect(belowResult).to.be.true;
        });

        it('should return false if standard deviation is above given threshold', () => {
            const result = evaluateStandardDeviation([1, 2, 3], 0.5);
            expect(result).to.be.false;
        });
    });

    describe('evaluatePercentile(...)', () => {
        it('should return true if the given percentile is below or equal the given threshold', () => {
            const result = evaluatePercentile([1, 2, 3], 0.5, 2);
            expect(result).to.be.true;
        });

        it('should return false if the given percentile is above the given threshold', () => {
            const result = evaluatePercentile([1, 2, 3], 0.5, 1.6);
            expect(result).to.be.false;
        });
    });

    describe('evaluatePercentiles(...)', () => {
        it('should return true if all percentiles are below the respective thresholds', () => {
            const percentilesStub = {
                "0.5": 3,
                "0.75": 4
            };
            const result = evaluatePercentiles([1, 2, 3, 4, 5], percentilesStub);
            expect(result).to.be.true;
        });

        it('should return false if any percentile is above the respective threshold', () => {
            const percentilesStub = {
                "0.50": 2,
                "0.75": 3
            };
            const result = evaluatePercentiles([1, 2, 3, 4, 5], percentilesStub);
            expect(result).to.be.false;
        });
    });

    describe('evaluateConditions(...)', () => {
        it('should return true if all conditions are met', () => {
            const conditionStub = {
                min: 0,
                max: 6,
                mean: 4,
                stdev: 1.6,
                percentiles: {
                    0.25: 2,
                    0.5: 3
                },
            };

            const result = evaluateConditions(conditionStub, [1, 2, 3, 4, 5]);
            expect(result).to.be.true;
        });

        it('should return false if any of the conditions is false', () => {
            const conditionStub = {
                min: 0,
                max: 6,
                mean: 2
            };

            const result = evaluateConditions(conditionStub, [1, 2, 3, 4, 5]);
            expect(result).to.be.false;
        });
    })
});
