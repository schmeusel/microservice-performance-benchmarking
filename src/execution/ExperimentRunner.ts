import { fork, ChildProcess } from 'child_process';
import * as path from 'path';
import LoggingService from '../services/LoggingService';
import { Pattern, PatternElementRequest, IPCMessage, IPCMessageType } from '../interfaces';
import OpenAPIService from '../services/OpenAPIService';
import { EventEmitter } from 'events';

class ExperimentRunner extends EventEmitter {
    private patterns: Pattern[];
    private workersAlive: number;
    private workersReady: number;
    private workers: ChildProcess[];

    constructor() {
        super();
        this.handleMessage = this.handleMessage.bind(this);
        this.handleWorkerDone = this.handleWorkerDone.bind(this);

        this.workers = [];
        this.workersAlive = 0;
        this.workersReady = 0;
    }

    initialize(patterns: Pattern[]): ExperimentRunner {
        this.patterns = patterns;
        return this;
    }

    start(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.patterns.forEach(pattern => {
                const worker = fork(path.resolve(__dirname, 'PatternRunner.js'));
                this.workersAlive += 1;
                worker.on('message', this.handleMessage);
                worker.on('exit', this.handleWorkerDone(resolve));
                // TODO handle options?
                worker.send({
                    type: IPCMessageType.START,
                    data: { pattern, openAPISpec: OpenAPIService.specification, options: {} }
                } as IPCMessage);

                this.workers.push(worker);
            });
        });
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

    private handleWorkerDone(resolveCallback: () => void) {
        return () => {
            this.workersAlive -= 1;
            if (this.workersAlive === 0) {
                resolveCallback();
            }
        };
    }
}

export default new ExperimentRunner();
