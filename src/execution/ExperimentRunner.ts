import { fork, ChildProcess } from 'child_process';
import * as path from 'path';
import LoggingService from '../services/LoggingService';
import { Pattern, PatternElementRequest, IPCMessage, IPCMessageType } from '../interfaces';
import OpenAPIService from '../services/OpenAPIService';
import { EventEmitter } from 'events';
import Server from '../webServer/Server';

class ExperimentRunner extends EventEmitter {
    private _resolve: () => void;
    private _reject: () => void;

    private patterns: Pattern[];
    private workersAlive: number;
    private workersReady: number;
    private workers: ChildProcess[];

    public isRunning: boolean;
    public patternStatistics: object;

    constructor() {
        super();
        this.handleMessage = this.handleMessage.bind(this);
        this.handleWorkerDone = this.handleWorkerDone.bind(this);

        this.workers = [];
        this.workersAlive = 0;
        this.workersReady = 0;
    }

    public initialize(patterns: Pattern[]): Promise<ExperimentRunner> {
        this.patterns = patterns;
        return new Promise((resolve, reject) => {
            LoggingService.logEvent('Starting the server');
            Server.start()
                .then(port => {
                    LoggingService.logEvent(`Server started on port ${port}`);
                    resolve(this);
                })
                .catch(reject);
        });
    }

    public start(): Promise<void> {
        this.isRunning = true;
        return new Promise((resolve, reject) => {
            this._resolve = resolve;
            this._reject = reject;
            this.patterns.forEach(pattern => {
                const worker = fork(path.resolve(__dirname, 'PatternRunner.js'));
                this.workersAlive += 1;
                worker.on('message', this.handleMessage);
                worker.on('exit', this.handleWorkerDone);
                // TODO handle options?
                worker.send({
                    type: IPCMessageType.START,
                    data: { pattern, openAPISpec: OpenAPIService.specification, options: {} }
                } as IPCMessage);

                this.workers.push(worker);
            });
        });
    }

    public failExperiment() {
        this.isRunning = false;
        this.workers.forEach(worker => {
            worker.send({
                type: IPCMessageType.ABORT
            });
        });
        this._reject();
    }

    public succeedExperiment() {
        this.isRunning = false;
        this._resolve();
    }

    private handleMessage(message: IPCMessage): void {
        switch (message.type) {
            case IPCMessageType.RESULT: {
                // TODO use constants
                console.log('result', message.data);

                this.emit('SOCKET_MEASUREMENT', message.data);
                LoggingService.addMeasurements(message.data);
                break;
            }
            case IPCMessageType.ERROR: {
                console.log('error in request runner', message.data);
                break;
            }
        }
    }

    private handleWorkerDone() {
        this.workersAlive -= 1;
        if (this.workersAlive === 0) {
            this.emit('BENCHMARK_COMPLETE');
        }
    }
}

export default new ExperimentRunner();
