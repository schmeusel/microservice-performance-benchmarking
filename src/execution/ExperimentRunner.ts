import { fork, ChildProcess } from 'child_process';
import * as path from 'path';
import LoggingService from '../services/LoggingService';
import { Pattern, PatternElementRequest, IPCMessage, IPCMessageType } from '../interfaces';
import PatternBuilder from '../workload/PatternBuilder';
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
                const worker = fork(path.resolve(__dirname, 'PatternRunner.js'), [
                    JSON.stringify(OpenAPIService.specification)
                ]);
                this.workersAlive += 1;
                worker.on('message', this.handleMessage);
                worker.on('exit', this.handleWorkerDone(resolve));
                worker.send({
                    type: IPCMessageType.INIT,
                    data: { pattern }
                } as IPCMessage);

                this.workers.push(worker);
            });
        });
    }

    private handleMessage(message: IPCMessage): void {
        switch (message.type) {
            case IPCMessageType.READY: {
                this.handleWorkerReady();
            }
            case IPCMessageType.RESULT: {
                // TODO use constants
                this.emit('SOCKET_MEASUREMENT', message.data);
                LoggingService.addMeasurements(message.data);
            }
        }
    }

    private handleWorkerReady() {
        this.workersReady += 1;
        if (this.workersReady === this.patterns.length) {
            this.workers.forEach(worker => {
                worker.send({
                    type: IPCMessageType.START
                });
            });
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
