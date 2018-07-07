import * as fs from 'fs';
import * as readline from 'readline';
import config from '../config';
import { SLASpecification } from '../interfaces/index';
import EvaluationError from '../exceptions/EvaluationError';
import { LoggingService } from "./LoggingService";
import { evaluateConditions, evaluatePatternConditions } from "../utils/EvaluationUtil";

class EvaluationService {

    private timestampStartIndex: number;
    private timestampEndIndex: number;
    private patternNameIndex: number;
    private patternSequenceIndex: number;

    private measurements: {
        [patternName: string]: {
            [sequenceIndex: string]: number[]
        }
    } = {};

    /**
     * Set service up with position of relevant properties in CSV log file.
     * @returns {Promise<any>}
     */
    public initialize(): Promise<any> {
        const csvKeys = LoggingService.getMeasurementCSVFields();

        this.timestampStartIndex = csvKeys.findIndex(key => key === 'timestampStart');
        this.timestampEndIndex = csvKeys.findIndex(key => key === 'timestampEnd');
        this.patternNameIndex = csvKeys.findIndex(key => key === 'pattern');
        this.patternSequenceIndex = csvKeys.findIndex(key => key === 'patternIndex');

        [this.timestampStartIndex, this.timestampEndIndex, this.patternNameIndex, this.patternSequenceIndex].forEach(index => {
            if (index < 0) {
                throw new EvaluationError('Could not find timestampStart, timestampEnd, pattern, and patternIndex in CSV config in LoggingService.');
            }
        });

        return Promise.resolve();
    }

    public evaluateMeasurements(slaSpec: SLASpecification): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.readMeasurements()
                .then(() => {
                    if (!Object.keys(this.measurements).length) {
                        throw new EvaluationError('No measurements found.');
                    }
                    const result = Object
                        .keys(slaSpec)
                        .every(patternName => evaluatePatternConditions(slaSpec[patternName], this.measurements[patternName]));
                    resolve(result);
                })
                .catch(reject);
        });
    }

    /**
     * Read measurements from file and store them in the format:
     * {
     *  [patternName]: {
     *      [sequenceIndex]: number[] // latencies
     *  }
     * }
     * @returns {Promise<void>}
     */
    private readMeasurements(): Promise<void> {
        return new Promise((resolve, reject) => {
            readline
                .createInterface({
                    input: fs.createReadStream(config.logging.loggers.measurements.filename, 'utf8')
                })
                .on('line', (line: string) => {
                    const values = line.split(',');
                    const latency = parseInt(values[this.timestampEndIndex]) - parseInt(values[this.timestampStartIndex]);
                    const patternName = values[this.patternNameIndex];
                    const sequenceIndex = values[this.patternSequenceIndex];

                    // ignore CSV header
                    if (patternName === 'pattern') {
                        return;
                    }

                    if (!this.measurements[patternName]) {
                        this.measurements[patternName] = {};
                    }
                    if (!this.measurements[patternName][sequenceIndex]) {
                        this.measurements[patternName][sequenceIndex] = []
                    }
                    this.measurements[patternName][sequenceIndex].push(latency);

                })
                .on('close', resolve)
                .on('error', reject);
        });
    }
}

export default new EvaluationService();
