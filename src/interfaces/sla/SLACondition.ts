export default interface SLACondition {
    min?: number;
    max?: number;
    mean?: number;
    stdev?: number;
    percentiles?: {
        [percentile: number]: number;
    };
};
