import { fork, ChildProcess } from 'child_process';
import * as path from 'path';
import LoggingService from '../services/LoggingService';
import {
    Pattern,
    IPCMessage,
    IPCMessageType,
} from '../interfaces';
import OpenAPIService from '../services/OpenAPIService';
import { EventEmitter } from 'events';
import EmitterConstants from '../constants/EmitterConstants';

class ExperimentRunner extends EventEmitter {
    private _resolve: () => void;
    private _reject: () => void;

    private patterns: Pattern[];
    private workersReady: number;
    private workers: { [patternName: string]: ChildProcess };

    constructor() {
        super();
        this.handleMessage = this.handleMessage.bind(this);
        this.handleWorkerDone = this.handleWorkerDone.bind(this);

        this.workers = {};
        this.workersReady = 0;
    }

    public initialize(patterns: Pattern[]): Promise<ExperimentRunner> {
        this.patterns = patterns;
        return Promise.resolve(this);
    }

    public start(): Promise<void> {
        return new Promise((resolve, reject) => {
            this._resolve = resolve;
            this._reject = reject;
            this.patterns
                .filter(pattern => pattern.amount > 0)
                .forEach(pattern => {
                    const worker = fork(path.resolve(__dirname, 'PatternRunner.js'));
                    this.workers[pattern.name] = worker;
                    worker.on('message', this.handleMessage);
                    worker.on('exit', this.handleWorkerDone(pattern.name));
                    worker.send({
                        type: IPCMessageType.START,
                        data: { pattern, openAPISpec: OpenAPIService.specification, options: {} }
                    } as IPCMessage);
                });
        });
    }

    public failExperiment() {
        Object.keys(this.workers).forEach(patternName => {
            this.workers[patternName].send({
                type: IPCMessageType.ABORT
            });
        });
        this._reject();
    }

    public succeedExperiment() {
        this._resolve();
    }

    private handleMessage(message: IPCMessage): void {
        switch (message.type) {
            case IPCMessageType.RESULT: {
                this.emit(EmitterConstants.PATTERN_MEASUREMENT, message.data);
                LoggingService.addPatternResult(message.data);
                return;
            }
            case IPCMessageType.ERROR: {
                LoggingService.logEvent('(PatternRunner ERROR): ' + JSON.stringify(message.data));
                return;
            }
            case IPCMessageType.INFO: {
                LoggingService.logEvent('(PatternRunner INFO): ' + JSON.stringify(message.data))
                return;
            }
        }
    }

    private handleWorkerDone(patternName: string) {
        return () => {
            LoggingService.logEvent(`Worker done with pattern: "${patternName}"`);
            const { [patternName]: name, ...rest } = this.workers;
            this.workers = rest;
            if (Object.keys(this.workers).length === 0) {
                LoggingService.logEvent('All workers done.');
                this.succeedExperiment();
            }
        };
    }
}

export default new ExperimentRunner();
