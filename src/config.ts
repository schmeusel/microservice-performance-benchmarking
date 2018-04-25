import * as path from 'path';

export default {
    logging: {
        measurements: {
            filename: 'measurements.log'
        },
        systemEvents: {
            filename: 'systemEvents.log'
        },
        workloads: {
            filename: (patternName: string) => `${patternName}.workload`,
            delimiter: '---------------'
        }
    }
};
