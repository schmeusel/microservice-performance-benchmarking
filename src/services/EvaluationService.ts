import * as fs from 'fs';
import * as readline from 'readline';
import config from '../config';
import { SLASpecification } from '../interfaces/index';
import EvaluationError from '../exceptions/EvaluationError';
import { LoggingService } from "./LoggingService";
import { evaluateConditions } from "../utils/EvaluationUtil";

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

    public evaluateMeasurements(slaSpec: SLASpecification): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.readMeasurements()
                .then(() => {
                    if (!Object.keys(this.measurements).length) {
                        throw new EvaluationError('No measurements found.');
                    }
                    const result = Object
                        .keys(slaSpec)
                        .map(patternName => evaluateConditions(slaSpec[patternName], this.measurements[patternName]))
                        .reduce((conditionsMet, result) => conditionsMet && result, true);
                    resolve(result);
                })
                .catch(reject);
        });
    }

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

                    // ignore CSV header
                    if (patternName === 'pattern') {
                        return;
                    }

                    if (!this.measurements[patternName]) {
                        this.measurements[patternName] = [];
                    }
                    this.measurements[patternName].push(latency);

                })
                .on('close', resolve)
                .on('error', reject);
        });
    }
}

export default new EvaluationService();
