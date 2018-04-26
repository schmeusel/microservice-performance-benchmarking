import * as path from 'path';

const config = {
    logging: {
        directory: 'logs',
        loggers: {
            measurements: {
                get filename() {
                    return path.join(config.logging.directory, 'measurements.log');
                }
            },
            systemEvents: {
                get filename() {
                    return path.join(config.logging.directory, 'systemEvents.log');
                }
            },
            workloads: {
                get directory() {
                    return path.join(config.logging.directory, 'workloads');
                },
                filename(patternName: string) {
                    return path.join(config.logging.loggers.workloads.directory, `${patternName}.workload`);
                }
            }
        }
    }
};

export default config;
